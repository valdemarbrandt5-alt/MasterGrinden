import { supabase } from "@/lib/supabase";
import { getMatch } from "@/lib/riot";

export async function getCachedMatch(matchId: string) {
  const { data: cached, error: readError } = await supabase
    .from("matches")
    .select("data")
    .eq("match_id", matchId)
    .maybeSingle();

  if (readError) {
    console.log("MATCH CACHE READ ERROR:", readError.message);
    throw new Error(readError.message);
  }

  if (cached?.data) {
    return cached.data;
  }

  const match = await getMatch(matchId);

  const { error: saveError } = await supabase.from("matches").upsert(
    {
      match_id: matchId,
      data: match,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "match_id",
    }
  );

  if (saveError) {
    console.log("MATCH CACHE SAVE ERROR:", saveError.message);
    throw new Error(saveError.message);
  }

  return match;
}

export async function getAllCachedMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("data")
    .order("created_at", { ascending: true });

  if (error) {
    console.log("MATCH CACHE READ ALL ERROR:", error.message);
    return [];
  }

  return data.map((row) => row.data);
}