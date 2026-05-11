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
  if (!isFridayCopenhagen()) return;

  const oldAwards = await readWeeklyAwards();
  const weekKey = getCopenhagenWeekKey();

  if (oldAwards?.weekKey === weekKey) return;

  const oldSnapshot = oldAwards?.snapshot ?? {};

  const eligiblePlayers = leaderboard
    .filter((p: any) => Number(p.trackedGames ?? 0) > 0)
    .map((p: any) => {
      const oldGames = Number(oldSnapshot[p.name]?.trackedGames ?? 0);
      const newGames = Number(p.trackedGames ?? 0);

      const oldDeathsTotal = Number(oldSnapshot[p.name]?.deathsTotal ?? 0);
      const newDeathsTotal = Number(p.avgDeaths ?? 0) * newGames;

      const gamesSinceLastFriday = newGames - oldGames;
      const deathsSinceLastFriday = newDeathsTotal - oldDeathsTotal;

      const weeklyDeathsPerGame =
        gamesSinceLastFriday > 0
          ? Number((deathsSinceLastFriday / gamesSinceLastFriday).toFixed(2))
          : 0;

      return {
        ...p,
        gamesSinceLastFriday,
        deathsSinceLastFriday,
        weeklyDeathsPerGame,
      };
    })
    .filter(
      (p: any) =>
        Number(p.gamesSinceLastFriday ?? 0) >=
        MIN_WEEKLY_GAMES_SINCE_LAST_FRIDAY
    );

  if (!eligiblePlayers.length) {
    console.log("NO WEEKLY AWARD ELIGIBLE PLAYERS");
    return;
  }

  const overallWinner = [...eligiblePlayers].sort(
    (a, b) => Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
  )[0];

  const improvedWinner = [...eligiblePlayers]
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
    .sort((a, b) => Number(b.improvement ?? 0) - Number(a.improvement ?? 0))[0];

  const intWinner = [...eligiblePlayers].sort(
    (a, b) =>
      Number(b.weeklyDeathsPerGame ?? 0) -
      Number(a.weeklyDeathsPerGame ?? 0)
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
      gamesSinceLastFriday: overallWinner.gamesSinceLastFriday ?? 0,
    },

    improvedWinner: {
      name: improvedWinner.name,
      improvement: improvedWinner.improvement ?? 0,
      oldScore: improvedWinner.oldScore ?? 0,
      newScore: improvedWinner.newScore ?? 0,
      gamesSinceLastFriday: improvedWinner.gamesSinceLastFriday ?? 0,
    },

    intWinner: {
      name: intWinner.name,
      weeklyDeathsPerGame: intWinner.weeklyDeathsPerGame ?? 0,
      deathsSinceLastFriday: Number(
        (intWinner.deathsSinceLastFriday ?? 0).toFixed(1)
      ),
      gamesSinceLastFriday: intWinner.gamesSinceLastFriday ?? 0,
    },

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