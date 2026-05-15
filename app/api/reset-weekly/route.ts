import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MIN_GAMES = 5;

export async function GET() {
  const { data: oldRow } = await supabase
    .from("weekly_awards")
    .select("data")
    .eq("id", "main")
    .maybeSingle();

  const oldData = oldRow?.data ?? {};
  const weeklyPlayers = oldData.weeklyPlayers ?? [];

  const eligiblePlayers = weeklyPlayers.filter(
    (p: any) => Number(p.trackedGames ?? 0) >= MIN_GAMES
  );

  const overallWinner = eligiblePlayers.length
    ? [...eligiblePlayers].sort(
        (a: any, b: any) =>
          Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
      )[0]
    : null;

  const improvedWinner = eligiblePlayers.length
    ? [...eligiblePlayers].sort(
        (a: any, b: any) =>
          Number(b.overallScore ?? 0) - Number(a.overallScore ?? 0)
      )[0]
    : null;

  const intWinner = eligiblePlayers.length
    ? [...eligiblePlayers].sort(
        (a: any, b: any) =>
          Number(b.topDeathsGame ?? 0) - Number(a.topDeathsGame ?? 0)
      )[0]
    : null;

  const nextWeekNumber = Number(oldData.weekNumber ?? 1) + 1;
  const resetAt = Math.floor(Date.now() / 1000);

  const newData = {
    ...oldData,
    weekNumber: nextWeekNumber,
    weekKey: `week-${nextWeekNumber}`,
    resetAt,
    updatedAt: new Date().toISOString(),

    overallWinner: overallWinner
      ? {
          name: overallWinner.name,
          overallScore: overallWinner.overallScore ?? 0,
          trackedGames: overallWinner.trackedGames ?? 0,
        }
      : null,

    improvedWinner: improvedWinner
      ? {
          name: improvedWinner.name,
          improvement: improvedWinner.overallScore ?? 0,
          oldScore: 0,
          newScore: improvedWinner.overallScore ?? 0,
          trackedGames: improvedWinner.trackedGames ?? 0,
        }
      : null,

    intWinner: intWinner
      ? {
          name: intWinner.name,
          topDeathsThisWeek: intWinner.topDeathsGame ?? 0,
          trackedGames: intWinner.trackedGames ?? 0,
        }
      : null,

    weeklyPlayers: [],
  };

  const { error } = await supabase.from("weekly_awards").upsert({
    id: "main",
    data: newData,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Weekly reset complete. New week: ${nextWeekNumber}`,
    resetAt,
  });
}