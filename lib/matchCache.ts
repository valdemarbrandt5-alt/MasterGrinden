import { supabase } from "@/lib/supabase";
import { getMatch } from "@/lib/riot";

export async function getCachedMatch(matchId: string) {
  const { data: cached } = await supabase
    .from("matches")
    .select("data")
    .eq("match_id", matchId)
    .maybeSingle();

  if (cached?.data) {
    return cached.data;
  }

  const match = await getMatch(matchId);

  await supabase.from("matches").upsert({
    match_id: matchId,
    data: match,
  });

  return match;
}

export async function getAllCachedMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("data");

  if (error) {
    console.log("MATCH CACHE READ ERROR:", error.message);
    return [];
  }

  return data.map((row) => row.data);
}