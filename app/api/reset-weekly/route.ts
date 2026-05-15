import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  const { error } = await supabase.from("weekly_awards").upsert({
    id: "main",
    data: {
      weekKey: "RESET",
      updatedAt: new Date().toISOString(),
      overallWinner: null,
      improvedWinner: null,
      intWinner: null,
      weeklyPlayers: [],
      snapshot: {},
    },
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Weekly reset complete",
  });
}