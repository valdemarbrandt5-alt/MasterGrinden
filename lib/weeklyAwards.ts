import { supabase } from "@/lib/supabase";

const WEEKLY_ID = "main";

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

  const activePlayers = leaderboard.filter(
    (p) => Number(p.trackedGames ?? 0) > 0
  );

  if (!activePlayers.length) return;

  const overallWinner = [...activePlayers].sort(
    (a, b) => Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
  )[0];

  const oldSnapshot = oldAwards?.snapshot ?? {};

  const improvedWinner = [...activePlayers]
    .map((p) => {
      const oldScore = Number(oldSnapshot[p.name]?.overallScore ?? p.overallScore ?? 0);
      const newScore = Number(p.overallScore ?? 0);

      return {
        ...p,
        improvement: Number((newScore - oldScore).toFixed(1)),
        oldScore,
        newScore,
      };
    })
    .sort((a, b) => Number(b.improvement ?? 0) - Number(a.improvement ?? 0))[0];

  const snapshot: Record<string, any> = {};

  for (const p of activePlayers) {
    snapshot[p.name] = {
      overallScore: Number(p.overallScore ?? 0),
      trackedGames: Number(p.trackedGames ?? 0),
      winrate: Number(p.winrate ?? 0),
      kda: Number(p.kda ?? 0),
    };
  }

  const weeklyData = {
    weekKey,
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