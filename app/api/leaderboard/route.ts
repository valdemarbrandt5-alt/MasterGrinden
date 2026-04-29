import { NextResponse } from "next/server";
import { readLeaderboard } from "@/lib/cache";

export async function GET() {
  const data = await readLeaderboard();

  if (!Array.isArray(data)) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}