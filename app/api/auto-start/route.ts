import { NextResponse } from "next/server";
import { startAutoRefresh } from "@/lib/autoRefresh";
import { supabase } from "@/lib/supabase";

export async function GET() {
  startAutoRefresh();

  return NextResponse.json({
    message: "Auto refresh started",
    interval: "1 hour",
  });
}

async function getWeeklyStartTimestamp() {
  const { data } = await supabase
    .from("weekly_awards")
    .select("data")
    .eq("id", "main")
    .maybeSingle();

  const manualResetAt = Number(data?.data?.resetAt ?? 0);

  if (manualResetAt > 0) {
    return manualResetAt;
  }

  return getLastFridayTimestamp();
}