import { NextResponse } from "next/server";
import { players } from "@/lib/players";
import { getAccount, getClashMatchIds } from "@/lib/riot";
import { getCachedClashMatch, getAllClashMatches } from "@/lib/clashCache";

const CLASH_START_TIME = Math.floor(
  new Date("2026-05-10T20:00:00+02:00").getTime() / 1000
);

function getStatAccounts(player: any) {
  return player.statAccounts ?? [
    {
      gameName: player.gameName,
      tagLine: player.tagLine,
    },
  ];
}

function getMatchTimestamp(match: any) {
  return (
    match.info.gameEndTimestamp ??
    match.info.gameStartTimestamp ??
    match.info.gameCreation
  );
}

function buildClashScore(p: any, gameMinutes: number, cs: number) {
  const kda =
    p.deaths > 0 ? (p.kills + p.assists) / p.deaths : p.kills + p.assists;

  const score =
    (p.win ? 100 : 0) +
    kda * 15 +
    p.totalDamageDealtToChampions / 300 +
    p.kills * 4 +
    (gameMinutes > 0 ? (cs / gameMinutes) * 3 : 0) +
    p.visionScore * 1.5 -
    p.deaths * 7;

  return Number(score.toFixed(1));
}

export async function POST() {
  try {
    const data = [];

    for (const player of players) {
      const statAccounts = getStatAccounts(player);

      for (const statAccount of statAccounts) {
        try {
          const account = await getAccount(
            statAccount.gameName,
            statAccount.tagLine
          );

          const matchIds = await getClashMatchIds(account.puuid, 10);

          for (const id of matchIds) {
            try {
              await getCachedClashMatch(id);
            } catch (error: any) {
              console.log("CLASH MATCH CACHE ERROR:", id, error.message);
            }
          }
        } catch (error: any) {
          console.log("CLASH ACCOUNT ERROR:", player.name, error.message);
        }
      }
    }

    const allMatches = await getAllClashMatches();

    const allTrackedPuuids: string[] = [];

    for (const player of players) {
      const statAccounts = getStatAccounts(player);

      for (const statAccount of statAccounts) {
        try {
          const account = await getAccount(
            statAccount.gameName,
            statAccount.tagLine
          );

          if (!allTrackedPuuids.includes(account.puuid)) {
            allTrackedPuuids.push(account.puuid);
          }
        } catch (error: any) {
          console.log("CLASH GLOBAL PUUID ERROR:", player.name, error.message);
        }
      }
    }

    for (const player of players) {
      const statAccounts = getStatAccounts(player);
      const statPuuids: string[] = [];

      for (const statAccount of statAccounts) {
        try {
          const account = await getAccount(
            statAccount.gameName,
            statAccount.tagLine
          );

          statPuuids.push(account.puuid);
        } catch (error: any) {
          console.log("CLASH PLAYER PUUID ERROR:", player.name, error.message);
        }
      }

      const playerMatches = allMatches.filter((match: any) => {
        if (!match?.info?.participants) return false;

        const isAfterClashStart =
          Math.floor(match.info.gameCreation / 1000) >= CLASH_START_TIME;

        const isRealGame = (match.info.gameDuration ?? 0) / 60 >= 5;

        const hasPlayer = match.info.participants.some((p: any) =>
          statPuuids.includes(p.puuid)
        );

        const trackedPlayersInMatch = match.info.participants.filter((p: any) =>
          allTrackedPuuids.includes(p.puuid)
        ).length;

        const isTeamGame = trackedPlayersInMatch >= 2;

        return isAfterClashStart && isRealGame && hasPlayer && isTeamGame;
      });

      const performances = playerMatches
        .map((match: any) =>
          match.info.participants.find((p: any) => statPuuids.includes(p.puuid))
        )
        .filter(Boolean);

      const games = performances.length;
      const wins = performances.filter((p: any) => p.win).length;
      const losses = games - wins;

      const kills = performances.reduce((s: number, p: any) => s + p.kills, 0);
      const deaths = performances.reduce(
        (s: number, p: any) => s + p.deaths,
        0
      );
      const assists = performances.reduce(
        (s: number, p: any) => s + p.assists,
        0
      );
      const damage = performances.reduce(
        (s: number, p: any) => s + p.totalDamageDealtToChampions,
        0
      );
      const vision = performances.reduce(
        (s: number, p: any) => s + p.visionScore,
        0
      );

      const recentMatches = [...playerMatches]
        .sort((a: any, b: any) => getMatchTimestamp(b) - getMatchTimestamp(a))
        .slice(0, 10)
        .map((match: any) => {
          const p = match.info.participants.find((x: any) =>
            statPuuids.includes(x.puuid)
          );

          if (!p) return null;

          const gameMinutes = match.info.gameDuration / 60;
          const cs = p.totalMinionsKilled + p.neutralMinionsKilled;

          return {
            win: p.win,
            champion: p.championName,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            damage: p.totalDamageDealtToChampions,
            vision: p.visionScore,
            csMin: gameMinutes > 0 ? Number((cs / gameMinutes).toFixed(1)) : 0,
            clashScore: buildClashScore(p, gameMinutes, cs),
            timestamp: getMatchTimestamp(match),
          };
        })
        .filter(Boolean);

      const totalScore = recentMatches.reduce(
        (sum: number, m: any) => sum + (m.clashScore ?? 0),
        0
      );

      data.push({
        ...player,
        clashGames: games,
        clashWins: wins,
        clashLosses: losses,
        clashWinrate: games > 0 ? Math.round((wins / games) * 100) : 0,
        clashKda:
          games > 0
            ? deaths > 0
              ? Number(((kills + assists) / deaths).toFixed(2))
              : kills + assists
            : 0,
        avgDamage: games > 0 ? Math.round(damage / games) : 0,
        avgVision: games > 0 ? Number((vision / games).toFixed(1)) : 0,
        pentakills: performances.reduce(
          (sum: number, p: any) => sum + (p.pentaKills ?? 0),
          0
        ),
        clashScore:
          games > 0 && recentMatches.length > 0
            ? Number((totalScore / recentMatches.length).toFixed(1))
            : 0,
        recentMatches,
      });
    }

    const activePlayers = data.filter((p: any) => Number(p.clashGames ?? 0) > 0);

    activePlayers.sort((a, b) => b.clashScore - a.clashScore);

    return NextResponse.json(activePlayers);
  } catch (error: any) {
    console.log("CLASH REFRESH FATAL ERROR:", error);

    return NextResponse.json(
      { error: error?.message ?? "Unknown clash refresh error" },
      { status: 500 }
    );
  }
}