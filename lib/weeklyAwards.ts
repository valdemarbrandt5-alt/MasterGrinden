import { supabase } from "@/lib/supabase";

const WEEKLY_ID = "main";
const MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY = 5;

function getCopenhagenWeekKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Copenhagen",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function isFridayCopenhagen(date = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Copenhagen",
    weekday: "short",
  }).format(date);

  return weekday === "Fri";
}

export async function readWeeklyAwards() {
  const { data, error } = await supabase
    .from("weekly_awards")
    .select("data")
    .eq("id", WEEKLY_ID)
    .maybeSingle();

  if (error) {
    console.log("WEEKLY AWARDS READ ERROR:", error.message);
    return null;
  }

  return data?.data ?? null;
}

export async function updateWeeklyAwardsIfNeeded(leaderboard: any[]) {
  //if (!isFridayCopenhagen()) return;

  const oldAwards = await readWeeklyAwards();
  const weekKey = getCopenhagenWeekKey();

 // if (oldAwards?.weekKey === weekKey) return;

  const weeklyPlayers = leaderboard
    .filter((p: any) => Number(p.weekly?.games ?? 0) > 0)
    .map((p: any) => ({
      ...p,
      trackedGames: Number(p.weekly.games ?? 0),
      wins: Number(p.weekly.wins ?? 0),
      losses: Number(p.weekly.losses ?? 0),
      winrate: Number(p.weekly.winrate ?? 0),
      overallScore: Number(p.weekly.overallScore ?? 0),
      kda: Number(p.weekly.kda ?? 0),
      avgKills: Number(p.weekly.avgKills ?? 0),
      avgDeaths: Number(p.weekly.avgDeaths ?? 0),
      avgAssists: Number(p.weekly.avgAssists ?? 0),
      avgDamage: Number(p.weekly.avgDamage ?? 0),
      avgCsMin: Number(p.weekly.avgCsMin ?? 0),
      avgVision: Number(p.weekly.avgVision ?? 0),
      topKillsGame: Number(p.weekly.topKillsGame ?? 0),
      topDeathsGame: Number(p.weekly.topDeathsGame ?? 0),
      pentakills: Number(p.weekly.pentakills ?? 0),
    }))
    .sort((a: any, b: any) => Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0));

  const eligiblePlayers = weeklyPlayers.filter(
    (p: any) =>
      Number(p.trackedGames ?? 0) >= MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY
  );

  if (!eligiblePlayers.length) {
    console.log("NO WEEKLY AWARD ELIGIBLE PLAYERS");

    const snapshot: Record<string, any> = {};

    for (const p of leaderboard) {
      snapshot[p.name] = {
        overallScore: Number(p.overallScore ?? 0),
        trackedGames: Number(p.trackedGames ?? 0),
        winrate: Number(p.winrate ?? 0),
        kda: Number(p.kda ?? 0),
        avgDeaths: Number(p.avgDeaths ?? 0),
        deathsTotal: Number(
          (Number(p.avgDeaths ?? 0) * Number(p.trackedGames ?? 0)).toFixed(2)
        ),
      };
    }

    const { error } = await supabase.from("weekly_awards").upsert({
      id: WEEKLY_ID,
      data: {
        weekKey,
        minGamesSinceLastFriday: MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY,
        updatedAt: new Date().toISOString(),
        overallWinner: null,
        improvedWinner: null,
        intWinner: null,
        weeklyPlayers,
        snapshot,
      },
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log("WEEKLY AWARDS SAVE ERROR:", error.message);
    }

    return;
  }

  const overallWinner = [...eligiblePlayers].sort(
    (a, b) => Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
  )[0];

  const oldAwardsSnapshot = oldAwards?.snapshot ?? {};

  const improvedWinner = [...eligiblePlayers]
    .map((p: any) => {
      const oldScore = Number(
        oldAwardsSnapshot[p.name]?.overallScore ?? p.overallScore ?? 0
      );
      const newScore = Number(p.overallScore ?? 0);

      return {
        ...p,
        improvement: Number((newScore - oldScore).toFixed(1)),
        oldScore,
        newScore,
      };
    })
    .sort((a, b) => Number(b.improvement ?? 0) - Number(a.improvement ?? 0))[0];

  const intWinner = [...eligiblePlayers].sort(
    (a, b) => Number(b.topDeathsGame ?? 0) - Number(a.topDeathsGame ?? 0)
  )[0];

  const snapshot: Record<string, any> = {};

  for (const p of leaderboard) {
    const trackedGames = Number(p.trackedGames ?? 0);
    const avgDeaths = Number(p.avgDeaths ?? 0);

    snapshot[p.name] = {
      overallScore: Number(p.overallScore ?? 0),
      trackedGames,
      winrate: Number(p.winrate ?? 0),
      kda: Number(p.kda ?? 0),
      avgDeaths,
      deathsTotal: Number((avgDeaths * trackedGames).toFixed(2)),
    };
  }

  const weeklyData = {
    weekKey,
    minGamesSinceLastFriday: MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY,
    updatedAt: new Date().toISOString(),

    overallWinner: {
      name: overallWinner.name,
      overallScore: overallWinner.overallScore ?? 0,
      trackedGames: overallWinner.trackedGames ?? 0,
    },

    improvedWinner: {
      name: improvedWinner.name,
      improvement: improvedWinner.improvement ?? 0,
      oldScore: improvedWinner.oldScore ?? 0,
      newScore: improvedWinner.newScore ?? 0,
      trackedGames: improvedWinner.trackedGames ?? 0,
    },

    intWinner: {
      name: intWinner.name,
      topDeathsThisWeek: intWinner.topDeathsGame ?? 0,
      trackedGames: intWinner.trackedGames ?? 0,
    },

    weeklyPlayers,
    snapshot,
  };

  const { error } = await supabase.from("weekly_awards").upsert({
    id: WEEKLY_ID,
    data: weeklyData,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.log("WEEKLY AWARDS SAVE ERROR:", error.message);
  }
}