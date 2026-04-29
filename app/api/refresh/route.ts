import { NextResponse } from "next/server";
import { players } from "@/lib/players";
import { saveLeaderboard } from "@/lib/cache";
import { getAccount, getRankByPuuid, getFlexMatchIds, getMatch } from "@/lib/riot";
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

export async function POST() {
  const data = [];

  for (const player of players) {
    try {
      const account = await getAccount(player.gameName, player.tagLine);
      const ranks = await getRankByPuuid(account.puuid);

      const flexRank = ranks.find(
        (r: any) => r.queueType === "RANKED_FLEX_SR"
      );

      const matchIds = await getFlexMatchIds(account.puuid, 2);

      const matches = [];

      for (const id of matchIds) {
        try {
          const match = await getMatch(id);
          matches.push(match);
        } catch {
          // skip failed match
        }
      }

      const trackedMatches = matches.filter(
        (m: any) =>
          Math.floor(m.info.gameCreation / 1000) >= TRACKING_START_TIME
      );

      const performances = trackedMatches
        .map((match: any) =>
          match.info.participants.find((p: any) => p.puuid === account.puuid)
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
        (sum: number, m: any) => sum + m.info.gameDuration / 60,
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

      const overallScore =
        trackedWinrate * 1.5 +
        kda * 12 +
        avgDamage / 350 +
        avgKills * 5 +
        avgCsMin * 3 +
        avgVision * 1.5 -
        avgDeaths * 8;

      const recentMatches = trackedMatches
        .slice(0, 5)
        .map((match: any) => {
          const playerStats = match.info.participants.find(
            (p: any) => p.puuid === account.puuid
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
              gameMinutes > 0 ? Number((matchCs / gameMinutes).toFixed(1)) : 0,
            timestamp:
              match.info.gameEndTimestamp ??
              match.info.gameStartTimestamp ??
              match.info.gameCreation,
          };
        })
        .filter(Boolean);

      data.push({
        ...player,
        tier: flexRank?.tier ?? "UNRANKED",
        rank: flexRank?.rank ?? "",
        lp: flexRank?.leaguePoints ?? 0,
        wins: trackedWins,
        losses: trackedLosses,
        winrate: trackedWinrate,
        score: flexRank
          ? rankValue(flexRank.tier, flexRank.rank, flexRank.leaguePoints)
          : 0,
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
        overallScore: Number(overallScore.toFixed(1)),
      });
    } catch (error: any) {
      data.push({
        ...player,
        tier: "ERROR",
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
        overallScore: 0,
        error: error.message,
      });
    }
  }

  data.sort((a, b) => b.score - a.score);

  await saveLeaderboard(data);

  return NextResponse.json(data);
}