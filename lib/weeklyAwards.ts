import { supabase } from "@/lib/supabase";

const WEEKLY_ID = "main";
const MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY = 5;

function getCopenhagenWeekKey(date = new Date()) {
  const copenhagenDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Europe/Copenhagen",
    })
  );

  const day = copenhagenDate.getDay();
  const daysSinceFriday = (day + 2) % 7;

  copenhagenDate.setDate(copenhagenDate.getDate() - daysSinceFriday);
  copenhagenDate.setHours(18, 0, 0, 0);

  if (date.getTime() < copenhagenDate.getTime()) {
    copenhagenDate.setDate(copenhagenDate.getDate() - 7);
  }

  const year = copenhagenDate.getFullYear();
  const month = String(copenhagenDate.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(copenhagenDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}-18`;
}

function isFridayAfter18Copenhagen(date = new Date()) {
  const copenhagenDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Europe/Copenhagen",
    })
  );

  return copenhagenDate.getDay() === 5 && copenhagenDate.getHours() >= 18;
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
  const oldAwards = await readWeeklyAwards();

  const resetAt = Number(oldAwards?.resetAt ?? 0);
  const weekNumber = Number(oldAwards?.weekNumber ?? 1);

  const weekKey =
    resetAt > 0 ? `manual-week-${weekNumber}` : getCopenhagenWeekKey();

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
      score: Number(p.score ?? 0),
      tier: p.tier,
      rank: p.rank,
      lp: p.lp,
    }))
    .sort(
      (a: any, b: any) =>
        Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
    );

  const eligiblePlayers = weeklyPlayers.filter(
    (p: any) =>
      Number(p.trackedGames ?? 0) >= MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY
  );

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

  const shouldCreateNewLockedAwards =
    resetAt === 0 &&
    isFridayAfter18Copenhagen() &&
    oldAwards?.weekKey !== weekKey;

  const shouldKeepOldAwards =
    oldAwards?.overallWinner || oldAwards?.improvedWinner || oldAwards?.intWinner;

  let overallWinner = oldAwards?.overallWinner ?? null;
  let improvedWinner = oldAwards?.improvedWinner ?? null;
  let intWinner = oldAwards?.intWinner ?? null;

  if (shouldCreateNewLockedAwards && eligiblePlayers.length > 0) {
    const calculatedOverallWinner = [...eligiblePlayers].sort(
      (a: any, b: any) =>
        Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
    )[0];

    const oldSnapshot = oldAwards?.snapshot ?? {};

    const calculatedImprovedWinner = [...eligiblePlayers]
      .map((p: any) => {
        const oldScore = Number(
          oldSnapshot[p.name]?.overallScore ?? p.overallScore ?? 0
        );
        const newScore = Number(p.overallScore ?? 0);

        return {
          ...p,
          improvement: Number((newScore - oldScore).toFixed(1)),
          oldScore,
          newScore,
        };
      })
      .sort(
        (a: any, b: any) =>
          Number(b.improvement ?? 0) - Number(a.improvement ?? 0)
      )[0];

    const calculatedIntWinner = [...eligiblePlayers].sort(
      (a: any, b: any) =>
        Number(b.topDeathsGame ?? 0) - Number(a.topDeathsGame ?? 0)
    )[0];

    overallWinner = {
      name: calculatedOverallWinner.name,
      overallScore: calculatedOverallWinner.overallScore ?? 0,
      trackedGames: calculatedOverallWinner.trackedGames ?? 0,
    };

    improvedWinner = {
      name: calculatedImprovedWinner.name,
      improvement: calculatedImprovedWinner.improvement ?? 0,
      oldScore: calculatedImprovedWinner.oldScore ?? 0,
      newScore: calculatedImprovedWinner.newScore ?? 0,
      trackedGames: calculatedImprovedWinner.trackedGames ?? 0,
    };

    intWinner = {
      name: calculatedIntWinner.name,
      topDeathsThisWeek: calculatedIntWinner.topDeathsGame ?? 0,
      trackedGames: calculatedIntWinner.trackedGames ?? 0,
    };
  }

  if (!shouldKeepOldAwards && eligiblePlayers.length > 0) {
    const calculatedOverallWinner = [...eligiblePlayers].sort(
      (a: any, b: any) =>
        Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
    )[0];

    const calculatedIntWinner = [...eligiblePlayers].sort(
      (a: any, b: any) =>
        Number(b.topDeathsGame ?? 0) - Number(a.topDeathsGame ?? 0)
    )[0];

    overallWinner = {
      name: calculatedOverallWinner.name,
      overallScore: calculatedOverallWinner.overallScore ?? 0,
      trackedGames: calculatedOverallWinner.trackedGames ?? 0,
    };

    improvedWinner = {
      name: calculatedOverallWinner.name,
      improvement: 0,
      oldScore: 0,
      newScore: calculatedOverallWinner.overallScore ?? 0,
      trackedGames: calculatedOverallWinner.trackedGames ?? 0,
    };

    intWinner = {
      name: calculatedIntWinner.name,
      topDeathsThisWeek: calculatedIntWinner.topDeathsGame ?? 0,
      trackedGames: calculatedIntWinner.trackedGames ?? 0,
    };
  }

  const weeklyData = {
    weekKey,
    weekNumber,
    resetAt,
    minGamesSinceLastFriday: MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY,
    updatedAt: new Date().toISOString(),

    overallWinner,
    improvedWinner,
    intWinner,

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