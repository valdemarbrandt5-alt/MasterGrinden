import { NextResponse } from "next/server";
import { players } from "@/lib/players";
import { readLeaderboard, saveLeaderboard } from "@/lib/cache";
import { getAccount, getRankByPuuid, getFlexMatchIds } from "@/lib/riot";
import { getCachedMatch, getAllCachedMatches } from "@/lib/matchCache";
import { acquireRefreshLock, releaseRefreshLock } from "@/lib/refreshLock";
import { TRACKING_START_TIME } from "@/lib/trackerSettings";

function rankValue(tier: string, rank: string, lp: number) {
  const tiers: Record<string, number> = {
    CHALLENGER: 10000,
    GRANDMASTER: 9000,
    MASTER: 8000,
    DIAMOND: 7000,
    EMERALD: 6000,
    PLATINUM: 5000,
    GOLD: 4000,
    SILVER: 3000,
    BRONZE: 2000,
    IRON: 1000,
  };

  const ranks: Record<string, number> = {
    I: 400,
    II: 300,
    III: 200,
    IV: 100,
  };

  return (tiers[tier] ?? 0) + (ranks[rank] ?? 0) + lp;
}

function getMatchTimestamp(match: any) {
  return (
    match.info.gameEndTimestamp ??
    match.info.gameStartTimestamp ??
    match.info.gameCreation
  );
}

function buildMatchScore(playerStats: any, gameMinutes: number, matchCs: number) {
  const matchKda =
    playerStats.deaths > 0
      ? (playerStats.kills + playerStats.assists) / playerStats.deaths
      : playerStats.kills + playerStats.assists;

  const matchScore =
    (playerStats.win ? 75 : 0) +
    matchKda * 12 +
    playerStats.totalDamageDealtToChampions / 350 +
    playerStats.kills * 5 +
    (gameMinutes > 0 ? (matchCs / gameMinutes) * 3 : 0) +
    playerStats.visionScore * 1.5 -
    playerStats.deaths * 8;

  return Number(matchScore.toFixed(1));
}

function findOldPlayer(oldLeaderboard: any[], player: any) {
  return oldLeaderboard.find(
    (p: any) =>
      p.name === player.name ||
      (p.gameName === player.gameName && p.tagLine === player.tagLine)
  );
}

function getStatAccounts(player: any) {
  return player.statAccounts ?? [
    {
      gameName: player.gameName,
      tagLine: player.tagLine,
    },
  ];
}

export async function POST() {
  const hasLock = await acquireRefreshLock();

  if (!hasLock) {
    return NextResponse.json(
      { error: "Refresh is already running. Try again in a few minutes." },
      { status: 409 }
    );
  }

  try {
    const oldLeaderboard = await readLeaderboard();
    const data = [];

    for (const player of players) {
      const statAccounts = getStatAccounts(player);

      for (const statAccount of statAccounts) {
        try {
          const statAccountData = await getAccount(
            statAccount.gameName,
            statAccount.tagLine
          );

          const matchIds = await getFlexMatchIds(statAccountData.puuid, 1);

          for (const id of matchIds) {
            try {
              await getCachedMatch(id);
            } catch (error: any) {
              console.log("MATCH CACHE ERROR:", id, error.message);
            }
          }
        } catch (error: any) {
          console.log(
            "CACHE WARMUP ACCOUNT ERROR:",
            player.name,
            statAccount.gameName,
            error.message
          );
        }
      }
    }

    const allMatches = await getAllCachedMatches();

    for (const player of players) {
      const oldPlayer = findOldPlayer(oldLeaderboard, player);

      try {
        const mainAccount = await getAccount(player.gameName, player.tagLine);

        let flexRank: any = null;
        let rankFetchError: string | null = null;

        try {
          const ranks = await getRankByPuuid(mainAccount.puuid);
          flexRank = ranks.find((r: any) => r.queueType === "RANKED_FLEX_SR");
        } catch (error: any) {
          rankFetchError = error.message;
          console.log("RANK FETCH ERROR:", player.name, error.message);
        }

        const tier = flexRank?.tier ?? oldPlayer?.tier ?? "UNRANKED";
        const rank = flexRank?.rank ?? oldPlayer?.rank ?? "";
        const lp = flexRank?.leaguePoints ?? oldPlayer?.lp ?? 0;

        const score = flexRank
          ? rankValue(flexRank.tier, flexRank.rank, flexRank.leaguePoints)
          : oldPlayer?.score ?? rankValue(tier, rank, lp);

        const statAccounts = getStatAccounts(player);
        const statPuuids: string[] = [];

        for (const statAccount of statAccounts) {
          try {
            const statAccountData = await getAccount(
              statAccount.gameName,
              statAccount.tagLine
            );

            statPuuids.push(statAccountData.puuid);
          } catch (error: any) {
            console.log(
              "STAT ACCOUNT FETCH ERROR:",
              player.name,
              statAccount.gameName,
              error.message
            );
          }
        }

        const trackedMatches = allMatches.filter((match: any) => {
          if (!match?.info?.participants) return false;

          const isAfterReset =
            Math.floor(match.info.gameCreation / 1000) >= TRACKING_START_TIME;

          const hasAnyStatAccount = match.info.participants.some((p: any) =>
            statPuuids.includes(p.puuid)
          );

          const gameMinutes = (match.info.gameDuration ?? 0) / 60;
          const isRealGame = gameMinutes >= 5;

          return isAfterReset && hasAnyStatAccount && isRealGame;
        });

        const sortedTrackedMatches = [...trackedMatches].sort(
          (a: any, b: any) => getMatchTimestamp(a) - getMatchTimestamp(b)
        );

        const performances = trackedMatches
          .map((match: any) =>
            match.info.participants.find((p: any) =>
              statPuuids.includes(p.puuid)
            )
          )
          .filter(Boolean);

        const sortedPerformances = sortedTrackedMatches
          .map((match: any) =>
            match.info.participants.find((p: any) =>
              statPuuids.includes(p.puuid)
            )
          )
          .filter(Boolean);

        const games = performances.length;

        const trackedWins = performances.filter((p: any) => p.win).length;
        const trackedLosses = games - trackedWins;
        const trackedWinrate =
          games > 0 ? Math.round((trackedWins / games) * 100) : 0;

        const kills = performances.reduce(
          (sum: number, p: any) => sum + p.kills,
          0
        );

        const deaths = performances.reduce(
          (sum: number, p: any) => sum + p.deaths,
          0
        );

        const assists = performances.reduce(
          (sum: number, p: any) => sum + p.assists,
          0
        );

        const damage = performances.reduce(
          (sum: number, p: any) => sum + p.totalDamageDealtToChampions,
          0
        );

        const vision = performances.reduce(
          (sum: number, p: any) => sum + p.visionScore,
          0
        );

        const cs = performances.reduce(
          (sum: number, p: any) =>
            sum + p.totalMinionsKilled + p.neutralMinionsKilled,
          0
        );

        const minutes = trackedMatches.reduce(
          (sum: number, match: any) => sum + match.info.gameDuration / 60,
          0
        );

        const kda =
          games > 0
            ? deaths > 0
              ? Number(((kills + assists) / deaths).toFixed(2))
              : kills + assists
            : 0;

        const avgKills = games > 0 ? Number((kills / games).toFixed(1)) : 0;
        const avgDeaths = games > 0 ? Number((deaths / games).toFixed(1)) : 0;
        const avgAssists = games > 0 ? Number((assists / games).toFixed(1)) : 0;
        const avgDamage = games > 0 ? Math.round(damage / games) : 0;
        const avgCsMin =
          games > 0 && minutes > 0 ? Number((cs / minutes).toFixed(1)) : 0;
        const avgVision = games > 0 ? Number((vision / games).toFixed(1)) : 0;

        const topKillsGame =
          games > 0 ? Math.max(...performances.map((p: any) => p.kills)) : 0;

        const topDeathsGame =
          games > 0 ? Math.max(...performances.map((p: any) => p.deaths)) : 0;

        let currentWinStreak = 0;
        let highestWinStreak = 0;

        for (const performance of sortedPerformances) {
          if (performance.win) {
            currentWinStreak += 1;
            highestWinStreak = Math.max(highestWinStreak, currentWinStreak);
          } else {
            currentWinStreak = 0;
          }
        }

        const pentakills = performances.reduce(
          (sum: number, p: any) => sum + (p.pentaKills ?? 0),
          0
        );

        const recentMatches = [...trackedMatches]
          .sort((a: any, b: any) => getMatchTimestamp(b) - getMatchTimestamp(a))
          .slice(0, 5)
          .map((match: any) => {
            const playerStats = match.info.participants.find((p: any) =>
              statPuuids.includes(p.puuid)
            );

            if (!playerStats) return null;

            const gameMinutes = match.info.gameDuration / 60;
            const matchCs =
              playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled;

            return {
              win: playerStats.win,
              champion: playerStats.championName,
              kills: playerStats.kills,
              deaths: playerStats.deaths,
              assists: playerStats.assists,
              damage: playerStats.totalDamageDealtToChampions,
              csMin:
                gameMinutes > 0
                  ? Number((matchCs / gameMinutes).toFixed(1))
                  : 0,
              matchScore: buildMatchScore(playerStats, gameMinutes, matchCs),
              timestamp: getMatchTimestamp(match),
            };
          })
          .filter(Boolean);

        const overallScore =
          recentMatches.length > 0
            ? Number(
                (
                  recentMatches.reduce(
                    (sum: number, match: any) => sum + (match.matchScore ?? 0),
                    0
                  ) / recentMatches.length
                ).toFixed(1)
              )
            : 0;

        data.push({
          ...player,
          tier,
          rank,
          lp,
          wins: trackedWins,
          losses: trackedLosses,
          winrate: trackedWinrate,
          score,
          trackedGames: games,
          recentMatches,
          kda,
          avgKills,
          avgDeaths,
          avgAssists,
          avgDamage,
          avgCsMin,
          avgVision,
          topKillsGame,
          topDeathsGame,
          currentWinStreak,
          highestWinStreak,
          pentakills,
          overallScore,
          error: rankFetchError
            ? "Rank endpoint failed. Using last known rank."
            : undefined,
        });
      } catch (error: any) {
        if (oldPlayer) {
          data.push({
            ...oldPlayer,
            error: "Refresh failed. Using last known data.",
          });
        } else {
          data.push({
            ...player,
            tier: "UNRANKED",
            rank: "",
            lp: 0,
            wins: 0,
            losses: 0,
            winrate: 0,
            score: 0,
            trackedGames: 0,
            recentMatches: [],
            kda: 0,
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            avgDamage: 0,
            avgCsMin: 0,
            avgVision: 0,
            topKillsGame: 0,
            topDeathsGame: 0,
            currentWinStreak: 0,
            highestWinStreak: 0,
            pentakills: 0,
            overallScore: 0,
            error: error.message,
          });
        }
      }
    }

    data.sort((a, b) => b.score - a.score);

    await saveLeaderboard(data);

    return NextResponse.json(data);
  } finally {
    await releaseRefreshLock();
  }
}