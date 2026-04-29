import { NextResponse } from "next/server";
import { startAutoRefresh } from "@/lib/autoRefresh";

export async function GET() {
  startAutoRefresh();

  return NextResponse.json({
    message: "Auto refresh started",
    interval: "1 hour",
  });
}