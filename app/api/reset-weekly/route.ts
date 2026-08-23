import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MIN_GAMES = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const expectedSecret = process.env.WEEKLY_RESET_SECRET;

    if (expectedSecret && body?.secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: row, error: readError } = await supabase
      .from("weekly_awards")
      .select("data")
      .eq("id", "main")
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    const oldData = row?.data ?? {};

    const weeklyPlayers = Array.isArray(oldData.weeklyPlayers)
      ? oldData.weeklyPlayers
      : [];

    const eligiblePlayers = weeklyPlayers.filter(
      (p: any) => Number(p.trackedGames ?? 0) >= MIN_GAMES
    );

    // ---------------------------
    // UGENS SPILLER
    // ---------------------------

    const overallWinner =
      eligiblePlayers.length > 0
        ? [...eligiblePlayers].sort(
            (a: any, b: any) =>
              Number(b.overallScore ?? 0) -
              Number(a.overallScore ?? 0)
          )[0]
        : null;

    // ---------------------------
    // UGENS INT
    // ---------------------------

    const intWinner =
      eligiblePlayers.length > 0
        ? [...eligiblePlayers].sort(
            (a: any, b: any) =>
              Number(b.topDeathsGame ?? 0) -
              Number(a.topDeathsGame ?? 0)
          )[0]
        : null;

    // ---------------------------
    // MEST IMPROVED
    // ---------------------------

    const previousWeekScores =
      oldData.previousWeekScores ?? {};

    const improvementCandidates = eligiblePlayers
      .filter((p: any) => {
        // Spilleren skal have en score fra ugen før
        return previousWeekScores[p.name] !== undefined;
      })
      .map((p: any) => {
        const oldScore = Number(previousWeekScores[p.name] ?? 0);
        const newScore = Number(p.overallScore ?? 0);

        return {
          ...p,
          oldScore,
          newScore,
          improvement: Number(
            (newScore - oldScore).toFixed(1)
          ),
        };
      });

    const improvedWinner =
      improvementCandidates.length > 0
        ? [...improvementCandidates].sort(
            (a: any, b: any) =>
              Number(b.improvement ?? 0) -
              Number(a.improvement ?? 0)
          )[0]
        : null;

    // ---------------------------
    // GEM DEN UGE DER LIGE SLUTTEDE
    // SOM BASELINE TIL NÆSTE UGE
    // ---------------------------

    const newPreviousWeekScores: Record<string, number> = {};

    for (const p of eligiblePlayers) {
      newPreviousWeekScores[p.name] =
        Number(p.overallScore ?? 0);
    }

    const nextWeekNumber =
      Number(oldData.weekNumber ?? 0) + 1;

    const resetAt = Math.floor(Date.now() / 1000);

    const newData = {
      ...oldData,

      weekNumber: nextWeekNumber,
      weekKey: `week-${nextWeekNumber}`,

      resetAt,

      minGamesSinceLastFriday: MIN_GAMES,

      updatedAt: new Date().toISOString(),

      // Awards fra ugen der lige sluttede
      overallWinner: overallWinner
        ? {
            name: overallWinner.name,
            overallScore:
              Number(overallWinner.overallScore ?? 0),
            trackedGames:
              Number(overallWinner.trackedGames ?? 0),
          }
        : null,

      improvedWinner: improvedWinner
        ? {
            name: improvedWinner.name,
            improvement:
              Number(improvedWinner.improvement ?? 0),

            oldScore:
              Number(improvedWinner.oldScore ?? 0),

            newScore:
              Number(improvedWinner.newScore ?? 0),

            trackedGames:
              Number(improvedWinner.trackedGames ?? 0),
          }
        : null,

      intWinner: intWinner
        ? {
            name: intWinner.name,
            topDeathsThisWeek:
              Number(intWinner.topDeathsGame ?? 0),

            trackedGames:
              Number(intWinner.trackedGames ?? 0),
          }
        : null,

      // Den afsluttede uge bliver baseline
      previousWeekScores: newPreviousWeekScores,

      // Ny uge starter tom
      weeklyPlayers: [],
    };

    const { error: saveError } = await supabase
      .from("weekly_awards")
      .upsert({
        id: "main",
        data: newData,
        updated_at: new Date().toISOString(),
      });

    if (saveError) {
      throw new Error(saveError.message);
    }

    return NextResponse.json({
      success: true,
      message: `Week ${nextWeekNumber} started`,
      awards: {
        overallWinner: newData.overallWinner,
        improvedWinner: newData.improvedWinner,
        intWinner: newData.intWinner,
      },
      previousWeekScores: newPreviousWeekScores,
      resetAt,
    });
  } catch (error: any) {
    console.error(
      "WEEKLY RESET ERROR:",
      error.message
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}