import { supabase } from "@/lib/supabase";
import { getMatch } from "@/lib/riot";

const MATCH_PAGE_SIZE = 50;
const RETRY_DELAY_MS = 750;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCachedMatch(matchId: string) {
  const { data: cached, error: readError } = await supabase
    .from("matches")
    .select("data")
    .eq("match_id", matchId)
    .maybeSingle();

  if (readError) {
    console.log(
      "MATCH CACHE READ ERROR:",
      matchId,
      readError.message
    );

    throw new Error(
      `Could not read cached match ${matchId}: ${readError.message}`
    );
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
    console.log(
      "MATCH CACHE SAVE ERROR:",
      matchId,
      saveError.message
    );

    throw new Error(
      `Could not save match ${matchId}: ${saveError.message}`
    );
  }

  return match;
}

async function loadMatchPage(from: number, to: number) {
  const { data, error } = await supabase
    .from("matches")
    .select("data")
    .order("match_id", { ascending: true })
    .range(from, to);

  return {
    data: data ?? [],
    error,
  };
}

export async function getAllCachedMatches() {
  const allMatches: any[] = [];

  let from = 0;

  while (true) {
    const to = from + MATCH_PAGE_SIZE - 1;

    console.log(`MATCH CACHE: loading rows ${from}-${to}`);

    let result = await loadMatchPage(from, to);

    if (result.error) {
      console.log(
        `MATCH CACHE PAGE FAILED rows ${from}-${to}:`,
        result.error.message
      );

      console.log("MATCH CACHE: retrying page...");

      await sleep(RETRY_DELAY_MS);

      result = await loadMatchPage(from, to);
    }

    if (result.error) {
      console.log(
        "MATCH CACHE PAGINATED READ ERROR:",
        `rows ${from}-${to}`,
        result.error.message
      );

      throw new Error(
        `Could not load cached matches rows ${from}-${to}: ${result.error.message}`
      );
    }

    const rows = result.data;

    for (const row of rows) {
      if (row?.data) {
        allMatches.push(row.data);
      }
    }

    console.log(
      `MATCH CACHE: loaded ${rows.length} rows, total ${allMatches.length}`
    );

    if (rows.length < MATCH_PAGE_SIZE) {
      break;
    }

    from += MATCH_PAGE_SIZE;
  }

  console.log(
    "MATCH CACHE COMPLETE:",
    allMatches.length,
    "matches loaded"
  );

  return allMatches;
}