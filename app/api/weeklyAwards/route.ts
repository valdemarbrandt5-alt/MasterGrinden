import { NextResponse } from "next/server";
import { readWeeklyAwards } from "@/lib/weeklyAwards";

export async function GET() {
  const awards = await readWeeklyAwards();
  return NextResponse.json(awards ?? null);
}