import { supabase } from "@/lib/supabase";

const WEEKLY_ID = "main";
const MIN_WEEKLY_GAMES = 5;

export async function readWeeklyAwards() {
  const { data, error } = await supabase
    .from("weekly_awards")
    .select("data")
    .eq("id", WEEKLY_ID)
    .maybeSingle();

  if (error) {
    console.log("WEEKLY AWARDS READ ERROR:", error.message);
    return null;
  }

  return data?.data ?? null;
}

export async function updateWeeklyAwardsIfNeeded(leaderboard: any[]) {
  const oldAwards = await readWeeklyAwards();

  /*
   * LIVE STATS FOR DEN NUVÆRENDE UGE
   *
   * Disse må gerne ændre sig hver gang man trykker
   * "Opdater stats".
   */
  const weeklyPlayers = leaderboard
    .filter((p: any) => Number(p.weekly?.games ?? 0) > 0)
    .map((p: any) => ({
      name: p.name,
      gameName: p.gameName,
      tagLine: p.tagLine,

      mainRole: p.mainRole,
      secondRole: p.secondRole,

      tier: p.tier,
      rank: p.rank,
      lp: Number(p.lp ?? 0),
      score: Number(p.score ?? 0),

      trackedGames: Number(p.weekly?.games ?? 0),

      wins: Number(p.weekly?.wins ?? 0),
      losses: Number(p.weekly?.losses ?? 0),
      winrate: Number(p.weekly?.winrate ?? 0),

      overallScore: Number(p.weekly?.overallScore ?? 0),

      kda: Number(p.weekly?.kda ?? 0),

      avgKills: Number(p.weekly?.avgKills ?? 0),
      avgDeaths: Number(p.weekly?.avgDeaths ?? 0),
      avgAssists: Number(p.weekly?.avgAssists ?? 0),

      avgDamage: Number(p.weekly?.avgDamage ?? 0),
      avgCsMin: Number(p.weekly?.avgCsMin ?? 0),
      avgVision: Number(p.weekly?.avgVision ?? 0),

      topKillsGame: Number(p.weekly?.topKillsGame ?? 0),
      topDeathsGame: Number(p.weekly?.topDeathsGame ?? 0),

      pentakills: Number(p.weekly?.pentakills ?? 0),

      currentWinStreak: Number(p.weekly?.currentWinStreak ?? 0),
      highestWinStreak: Number(p.weekly?.highestWinStreak ?? 0),
    }))
    .sort(
      (a: any, b: any) =>
        Number(b.overallScore ?? 0) -
        Number(a.overallScore ?? 0)
    );

  /*
   * VIGTIGT:
   *
   * Awards bliver IKKE beregnet her.
   *
   * De skal være resultatet fra den AFSLUTTEDE uge
   * og derfor forblive låst indtil næste reset.
   */
  const weeklyData = {
    /*
     * Bevar uge information
     */
    weekNumber: Number(oldAwards?.weekNumber ?? 1),

    weekKey:
      oldAwards?.weekKey ??
      `week-${Number(oldAwards?.weekNumber ?? 1)}`,

    resetAt: Number(oldAwards?.resetAt ?? 0),

    minGamesSinceLastFriday:
      Number(
        oldAwards?.minGamesSinceLastFriday ??
          MIN_WEEKLY_GAMES
      ),

    /*
     * LOCKED AWARDS
     *
     * Må IKKE ændres ved almindelig refresh.
     */
    overallWinner:
      oldAwards?.overallWinner ?? null,

    improvedWinner:
      oldAwards?.improvedWinner ?? null,

    intWinner:
      oldAwards?.intWinner ?? null,

    /*
     * Sidste afsluttede uges scores.
     *
     * Bruges næste gang vi skal finde
     * "Mest improved".
     */
    previousWeekScores:
      oldAwards?.previousWeekScores ?? {},

    /*
     * Aktuel uge.
     *
     * Denne del må ændre sig live.
     */
    weeklyPlayers,

    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("weekly_awards")
    .upsert({
      id: WEEKLY_ID,
      data: weeklyData,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.log(
      "WEEKLY AWARDS SAVE ERROR:",
      error.message
    );
  }
}