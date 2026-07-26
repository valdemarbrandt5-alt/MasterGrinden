import { supabase } from "@/lib/supabase";
import { getMatch } from "@/lib/riot";

const MATCH_PAGE_SIZE = 250;

export async function getCachedMatch(matchId: string) {
  const { data: cached, error: readError } = await supabase
    .from("matches")
    .select("data")
    .eq("match_id", matchId)
    .maybeSingle();

  if (readError) {
    console.log("MATCH CACHE READ ERROR:", matchId, readError.message);
    throw new Error(`Could not read cached match ${matchId}: ${readError.message}`);
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
    console.log("MATCH CACHE SAVE ERROR:", matchId, saveError.message);
    throw new Error(`Could not save match ${matchId}: ${saveError.message}`);
  }

  return match;
}

export async function getAllCachedMatches() {
  const allMatches: any[] = [];

  let from = 0;

  while (true) {
    const to = from + MATCH_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("matches")
      .select("data")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      console.log(
        "MATCH CACHE PAGINATED READ ERROR:",
        `rows ${from}-${to}`,
        error.message
      );

      throw new Error(`Could not load cached matches: ${error.message}`);
    }

    const rows = data ?? [];

    for (const row of rows) {
      if (row?.data) {
        allMatches.push(row.data);
      }
    }

    if (rows.length < MATCH_PAGE_SIZE) {
      break;
    }

    from += MATCH_PAGE_SIZE;
  }

  console.log("MATCH CACHE LOADED:", allMatches.length, "matches");

  return allMatches;
}