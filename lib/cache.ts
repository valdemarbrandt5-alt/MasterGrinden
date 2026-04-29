import { supabase } from "@/lib/supabase";

const LEADERBOARD_ID = "main";

export async function readLeaderboard() {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("data")
    .eq("id", LEADERBOARD_ID)
    .maybeSingle();

  if (error) {
    console.log("SUPABASE READ ERROR:", error.message);
    return [];
  }

  if (!data?.data) {
    return [];
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

export async function saveLeaderboard(leaderboardData: any[]) {
  const safeData = Array.isArray(leaderboardData) ? leaderboardData : [];

  const { error } = await supabase.from("leaderboard").upsert({
    id: LEADERBOARD_ID,
    data: safeData,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.log("SUPABASE SAVE ERROR:", error.message);
    throw new Error(error.message);
  }
}