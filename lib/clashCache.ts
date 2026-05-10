import { supabase } from "@/lib/supabase";
import { getMatch } from "@/lib/riot";

export async function getCachedClashMatch(matchId: string, tournamentId = "main") {
  const { data: cached } = await supabase
    .from("clash_matches")
    .select("data")
    .eq("match_id", matchId)
    .maybeSingle();

  if (cached?.data) return cached.data;

  const match = await getMatch(matchId);

  // Gem kun rigtige Clash games
  if (match?.info?.queueId !== 700) {
    console.log("SKIPPING NON-CLASH MATCH:", matchId, match?.info?.queueId);
    return null;
  }

  await supabase.from("clash_matches").upsert({
    match_id: matchId,
    tournament_id: tournamentId,
    data: match,
  });

  return match;
}

export async function getAllClashMatches() {
  const { data, error } = await supabase
    .from("clash_matches")
    .select("data");

  if (error) {
    console.log("CLASH CACHE READ ERROR:", error.message);
    return [];
  }

  return data?.map((row) => row.data) ?? [];
}