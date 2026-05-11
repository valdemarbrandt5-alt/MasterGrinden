"use client";

import { useEffect, useState } from "react";

function rankColor(tier: string) {
  const colors: Record<string, string> = {
    CHALLENGER: "text-yellow-300 border-yellow-300/40 bg-yellow-300/10",
    GRANDMASTER: "text-red-400 border-red-400/40 bg-red-400/10",
    MASTER: "text-purple-400 border-purple-400/40 bg-purple-400/10",
    DIAMOND: "text-cyan-300 border-cyan-300/40 bg-cyan-300/10",
    EMERALD: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    PLATINUM: "text-teal-300 border-teal-300/40 bg-teal-300/10",
    GOLD: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
    SILVER: "text-zinc-300 border-zinc-300/40 bg-zinc-300/10",
    BRONZE: "text-orange-500 border-orange-500/40 bg-orange-500/10",
    IRON: "text-stone-400 border-stone-400/10 bg-stone-400/10",
    UNRANKED: "text-zinc-500 border-zinc-500/40 bg-zinc-500/10",
    ERROR: "text-red-500 border-red-500/40 bg-red-500/10",
  };

  return colors[tier] ?? colors.UNRANKED;
}

function rankIcon(tier: string) {
  const t = tier?.trim().toLowerCase();

  const icons: Record<string, string> = {
    iron: "/ranks/iron.png",
    bronze: "/ranks/bronze.png",
    silver: "/ranks/silver.png",
    gold: "/ranks/gold.png",
    platinum: "/ranks/platinum.png",
    emerald: "/ranks/emerald.png",
    diamond: "/ranks/diamond.png",
    master: "/ranks/master.png",
    grandmaster: "/ranks/grandmaster.png",
    challenger: "/ranks/challenger.png",
  };

  return icons[t] ?? null;
}

function statColor(value: number, best: number, worst: number, reverse = false) {
  if (best === worst) return "text-white";

  if (!reverse) {
    if (value === best) return "text-green-400 font-bold";
    if (value === worst) return "text-red-400 font-bold";
  } else {
    if (value === best) return "text-red-400 font-bold";
    if (value === worst) return "text-green-400 font-bold";
  }

  return "text-zinc-200";
}

function formatDate(timestamp: number) {
  if (!timestamp) return "Ukendt dato";

  return new Date(timestamp).toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getLeader(players: any[], key: string, highest = true) {
  if (!players.length) return null;

  return [...players].sort((a, b) => {
    const av = Number(a[key] ?? 0);
    const bv = Number(b[key] ?? 0);
    return highest ? bv - av : av - bv;
  })[0];
}

function AwardCard({
  title,
  player,
  value,
  tone = "green",
}: {
  title: string;
  player: any;
  value: string | number;
  tone?: "green" | "red" | "purple" | "yellow" | "blue";
}) {
  const tones = {
    green: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    red: "text-red-400 border-red-500/30 bg-red-500/10",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    yellow: "text-yellow-300 border-yellow-400/30 bg-yellow-400/10",
    blue: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10",
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="mt-1 text-2xl font-black">{player?.name ?? "-"}</div>
      <div className="mt-1 text-zinc-300">{value}</div>
    </div>
  );
}

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [weeklyAwards, setWeeklyAwards] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPlayers, setOpenPlayers] = useState<Record<string, boolean>>({});

  const [sortKey, setSortKey] = useState("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  function togglePlayer(name: string) {
    setOpenPlayers((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  async function loadData() {
    try {
      const res = await fetch("/api/leaderboard", {
        cache: "no-store",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPlayers(data);
      } else {
        setPlayers([]);
        setMessage("Leaderboard data er ikke et array.");
      }
    } catch {
      setMessage("Kunne ikke hente leaderboard.");
      setPlayers([]);
    }
  }

  async function loadWeeklyAwards() {
    try {
      const res = await fetch("/api/weekly-awards", {
        cache: "no-store",
      });

      const data = await res.json();
      setWeeklyAwards(data);
    } catch {
      setWeeklyAwards(null);
    }
  }

  async function refreshData() {
    try {
      setLoading(true);
      setMessage("Opdaterer stats...");

      const res = await fetch("/api/refresh", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error ?? "Refresh fejlede.");
        return;
      }

      if (Array.isArray(data)) {
        setPlayers(data);
        setMessage("Stats opdateret.");
        loadWeeklyAwards();
      } else {
        setMessage("Refresh gav forkert data tilbage.");
      }
    } catch {
      setMessage("Refresh fejlede. Riot eller Vercel er sur.");
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key: string) {
    setSortKey((currentKey) => {
      if (currentKey === key) {
        setSortDirection((currentDirection) =>
          currentDirection === "desc" ? "asc" : "desc"
        );
        return currentKey;
      }

      setSortDirection("desc");
      return key;
    });
  }

  function sortArrow(column: string) {
    if (sortKey !== column) return "";
    return sortDirection === "desc" ? "↓" : "↑";
  }

  useEffect(() => {
    loadData();
    loadWeeklyAwards();
  }, []);

  const activePlayers = players.filter((p) => Number(p.trackedGames ?? 0) > 0);

  const sortedPlayers = [...activePlayers].sort((a, b) => {
    const av = Number(a[sortKey] ?? 0);
    const bv = Number(b[sortKey] ?? 0);

    if (sortDirection === "desc") return bv - av;
    return av - bv;
  });

  const bestWinrate = activePlayers.length
    ? Math.max(...activePlayers.map((p) => Number(p.winrate ?? 0)))
    : 0;

  const worstWinrate = activePlayers.length
    ? Math.min(...activePlayers.map((p) => Number(p.winrate ?? 0)))
    : 0;

  const bestKda = activePlayers.length
    ? Math.max(...activePlayers.map((p) => Number(p.kda ?? 0)))
    : 0;

  const worstKda = activePlayers.length
    ? Math.min(...activePlayers.map((p) => Number(p.kda ?? 0)))
    : 0;

  const bestDamage = activePlayers.length
    ? Math.max(...activePlayers.map((p) => Number(p.avgDamage ?? 0)))
    : 0;

  const worstDamage = activePlayers.length
    ? Math.min(...activePlayers.map((p) => Number(p.avgDamage ?? 0)))
    : 0;

  const bestDeaths = activePlayers.length
    ? Math.max(...activePlayers.map((p) => Number(p.avgDeaths ?? 0)))
    : 0;

  const worstDeaths = activePlayers.length
    ? Math.min(...activePlayers.map((p) => Number(p.avgDeaths ?? 0)))
    : 0;

  const bestTopKillsGame = activePlayers.length
    ? Math.max(...activePlayers.map((p) => Number(p.topKillsGame ?? 0)))
    : 0;

  const worstTopDeathsGame = activePlayers.length
    ? Math.max(...activePlayers.map((p) => Number(p.topDeathsGame ?? 0)))
    : 0;

    const awardPlayers = activePlayers.filter(
  (p) => Number(p.trackedGames ?? 0) >= 5
);
  const overallBest = getLeader(awardPlayers, "overallScore", true);
const topDamage = getLeader(awardPlayers, "avgDamage", true);
const topWinrate = getLeader(awardPlayers, "winrate", true);
const topKda = getLeader(awardPlayers, "kda", true);
const topKillsGame = getLeader(awardPlayers, "topKillsGame", true);
const topDeathsGame = getLeader(awardPlayers, "topDeathsGame", true);
const topDeathsPerGame = getLeader(awardPlayers, "avgDeaths", true);
const topWinStreak = getLeader(awardPlayers, "highestWinStreak", true);
const topPentakills = getLeader(awardPlayers, "pentakills", true);
  const totalTrackedGames = activePlayers.reduce(
    (sum, p) => sum + Number(p.trackedGames ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-black">Flex Master Tracker</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tracked games i alt: {totalTrackedGames}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <button
            onClick={refreshData}
            disabled={loading}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Opdaterer..." : "Opdater stats"}
          </button>

          {message && <div className="text-sm text-zinc-400">{message}</div>}
        </div>
      </div>

      {activePlayers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
          Ingen recorded games endnu. Spillere kommer først på leaderboardet,
          når de har mindst ét tracked game.
        </div>
      ) : (
        <>
          {weeklyAwards && (
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6 text-yellow-300">
                <div className="text-sm opacity-80">Ugens spiller</div>
                <div className="mt-1 text-3xl font-black">
                  {weeklyAwards.overallWinner?.name ?? "-"}
                </div>
                <div className="mt-1 text-zinc-300">
                  {weeklyAwards.overallWinner?.overallScore ?? 0} overall score
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-400">
                <div className="text-sm opacity-80">Mest improved</div>
                <div className="mt-1 text-3xl font-black">
                  {weeklyAwards.improvedWinner?.name ?? "-"}
                </div>
                <div className="mt-1 text-zinc-300">
                  +{weeklyAwards.improvedWinner?.improvement ?? 0} score siden
                  sidste uge
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-9">
            <AwardCard
              title="Overall bedste"
              player={overallBest}
              value={`${overallBest?.overallScore ?? 0} score`}
              tone="purple"
            />
            <AwardCard
              title="Top damage"
              player={topDamage}
              value={`${(topDamage?.avgDamage ?? 0).toLocaleString()} dmg/game`}
              tone="green"
            />
            <AwardCard
              title="Bedste winrate"
              player={topWinrate}
              value={`${topWinrate?.winrate ?? 0}%`}
              tone="green"
            />
            <AwardCard
              title="Bedste KDA"
              player={topKda}
              value={topKda?.kda ?? 0}
              tone="blue"
            />
            <AwardCard
              title="Flest kills i ét game"
              player={topKillsGame}
              value={`${topKillsGame?.topKillsGame ?? 0} kills`}
              tone="yellow"
            />
            <AwardCard
              title="Flest døde i ét game"
              player={topDeathsGame}
              value={`${topDeathsGame?.topDeathsGame ?? 0} deaths`}
              tone="red"
            />
            <AwardCard
              title="Flest døde pr. game"
              player={topDeathsPerGame}
              value={`${topDeathsPerGame?.avgDeaths ?? 0} deaths/game`}
              tone="red"
            />
            <AwardCard
              title="Højeste winstreak"
              player={topWinStreak}
              value={`${topWinStreak?.highestWinStreak ?? 0} wins`}
              tone="yellow"
            />
            <AwardCard
              title="Pentakills"
              player={topPentakills}
              value={`${topPentakills?.pentakills ?? 0} pentas`}
              tone="purple"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
            <table className="w-full min-w-[1350px] text-left text-sm">
              <thead className="bg-zinc-900 text-zinc-300">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Spiller</th>
                  <th className="px-3 py-3">Role</th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("score")}
                  >
                    Flex Rank {sortArrow("score")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("wins")}
                  >
                    Tracked W/L {sortArrow("wins")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("winrate")}
                  >
                    Tracked WR {sortArrow("winrate")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("trackedGames")}
                  >
                    Games {sortArrow("trackedGames")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("overallScore")}
                  >
                    Overall {sortArrow("overallScore")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("kda")}
                  >
                    KDA {sortArrow("kda")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("avgKills")}
                  >
                    Avg kills {sortArrow("avgKills")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("avgDeaths")}
                  >
                    Avg deaths {sortArrow("avgDeaths")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("avgAssists")}
                  >
                    Avg assists {sortArrow("avgAssists")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("topKillsGame")}
                  >
                    Top kills {sortArrow("topKillsGame")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("topDeathsGame")}
                  >
                    Top deaths {sortArrow("topDeathsGame")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("highestWinStreak")}
                  >
                    Winstreak {sortArrow("highestWinStreak")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("pentakills")}
                  >
                    Pentas {sortArrow("pentakills")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("avgDamage")}
                  >
                    Damage {sortArrow("avgDamage")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("avgCsMin")}
                  >
                    CS/min {sortArrow("avgCsMin")}
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap p-4 hover:text-white"
                    onClick={() => handleSort("avgVision")}
                  >
                    Vision {sortArrow("avgVision")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedPlayers.map((p, index) => (
                  <tr
                    key={`${p.name}-${p.gameName}`}
                    className="border-t border-zinc-800 hover:bg-zinc-900/60"
                  >
                    <td className="p-4 text-xl font-bold">{index + 1}</td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <span>{p.name}</span>

                        {Number(p.currentWinStreak ?? 0) > 2 && (
                          <div
                            title={`${p.currentWinStreak} win streak`}
                            className="relative flex h-7 w-7 items-center justify-center"
                          >
                            <img
                              src="/emojis/Flame.png"
                              alt="Flame"
                              className="h-7 w-7 object-contain"
                            />
                            <span
                              className="absolute mt-1 text-[18px] font-black text-white"
                              style={{
                                textShadow: `
                                  0 0 2px black,
                                  0 0 4px black,
                                  1px 1px 0 black,
                                  -1px -1px 0 black,
                                  1px -1px 0 black,
                                  -1px 1px 0 black
                                `,
                              }}
                            >
                              {p.currentWinStreak}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-zinc-500">
                        {p.gameName}#{p.tagLine}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm">
                        {p.mainRole} / {p.secondRole}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {rankIcon(p.tier) && (
                          <img
                            src={rankIcon(p.tier)!}
                            alt={p.tier}
                            className="h-10 w-10 min-w-10 object-contain"
                          />
                        )}

                        <span
                          className={`rounded-full border px-3 py-1 font-bold ${rankColor(
                            p.tier
                          )}`}
                        >
                          {p.tier} {p.rank} {p.lp} LP
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      {p.wins}W / {p.losses}L
                    </td>

                    <td
                      className={`p-4 ${statColor(
                        p.winrate,
                        bestWinrate,
                        worstWinrate
                      )}`}
                    >
                      {p.winrate}%
                    </td>

                    <td className="px-3 py-3">{p.trackedGames}</td>

                    <td className="p-4 font-bold text-purple-400">
                      {p.overallScore ?? 0}
                    </td>

                    <td className={`p-4 ${statColor(p.kda, bestKda, worstKda)}`}>
                      {p.kda}
                    </td>

                    <td className="p-4 text-green-400">{p.avgKills}</td>

                    <td
                      className={`p-4 ${statColor(
                        p.avgDeaths,
                        bestDeaths,
                        worstDeaths,
                        true
                      )}`}
                    >
                      {p.avgDeaths}
                    </td>

                    <td className="p-4 text-sky-400">{p.avgAssists}</td>

                    <td
                      className={`p-4 ${statColor(
                        p.topKillsGame,
                        bestTopKillsGame,
                        0
                      )}`}
                    >
                      {p.topKillsGame ?? 0}
                    </td>

                    <td
                      className={`p-4 ${statColor(
                        p.topDeathsGame,
                        worstTopDeathsGame,
                        0,
                        true
                      )}`}
                    >
                      {p.topDeathsGame ?? 0}
                    </td>

                    <td className="p-4 font-bold text-yellow-300">
                      {p.highestWinStreak ?? 0}
                    </td>

                    <td className="p-4 font-bold text-purple-400">
                      {p.pentakills ?? 0}
                    </td>

                    <td
                      className={`p-4 ${statColor(
                        p.avgDamage,
                        bestDamage,
                        worstDamage
                      )}`}
                    >
                      {(p.avgDamage ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4">{p.avgCsMin}</td>
                    <td className="p-4">{p.avgVision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-zinc-500">
            Klik på kolonneoverskrifterne for at sortere. Spillere uden recorded
            games vises ikke endnu.
          </p>

          <div className="mt-10 space-y-6">
            {activePlayers.map((p) => (
              <div
                key={`recent-${p.name}-${p.gameName}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div
                  onClick={() => togglePlayer(p.name)}
                  className="flex cursor-pointer flex-col gap-1 md:flex-row md:items-end md:justify-between"
                >
                  <div>
                    <h2 className="text-2xl font-bold">{p.name}</h2>
                    <p className="text-sm text-zinc-500">
                      Seneste tracked games
                    </p>
                  </div>

                  <div className="text-sm text-zinc-500">
                    {openPlayers[p.name] ? "Skjul" : "Vis"} ·{" "}
                    {p.recentMatches?.length ?? 0} games
                  </div>
                </div>

                {openPlayers[p.name] && (
                  <div className="mt-4 space-y-2">
                    {p.recentMatches?.length > 0 ? (
                      p.recentMatches.map((match: any, i: number) => (
                        <div
                          key={`${p.name}-match-${i}`}
                          className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`rounded-lg px-3 py-1 text-sm font-bold ${
                                match.win
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-red-500/15 text-red-400"
                              }`}
                            >
                              {match.win ? "WIN" : "LOSS"}
                            </span>

                            <div>
                              <div className="font-semibold">
                                {match.champion}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {match.kills}/{match.deaths}/{match.assists}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm md:gap-6">
                            <div className="font-bold text-purple-400">
                              {match.matchScore ?? 0} pts
                            </div>

                            <div className="text-zinc-300">
                              {(match.damage ?? 0).toLocaleString()} dmg
                            </div>

                            <div className="text-zinc-300">
                              {match.csMin} CS/min
                            </div>

                            <div className="text-zinc-500">
                              {formatDate(match.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
                        Ingen tracked games endnu.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}