"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatDate(timestamp: number) {
  if (!timestamp) return "Ukendt dato";

  return new Date(timestamp).toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getLeader(players: any[], key: string) {
  if (!players.length) return null;

  return [...players].sort(
    (a, b) => Number(b[key] ?? 0) - Number(a[key] ?? 0)
  )[0];
}

function AwardCard({
  title,
  player,
  value,
  tone = "purple",
}: {
  title: string;
  player: any;
  value: string | number;
  tone?: "purple" | "green" | "red" | "yellow" | "blue";
}) {
  const tones = {
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    green: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    red: "text-red-400 border-red-500/30 bg-red-500/10",
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

export default function ClashPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPlayers, setOpenPlayers] = useState<Record<string, boolean>>({});

  async function refreshClash() {
    try {
      setLoading(true);
      setMessage("Opdaterer Clash stats...");

      const res = await fetch("/api/clash/refresh", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setMessage("Clash refresh fejlede.");
        return;
      }

      setPlayers(data.filter((p: any) => Number(p.clashGames ?? 0) > 0));
      setMessage("Clash stats opdateret.");
    } catch {
      setMessage("Clash refresh fejlede.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshClash();
  }, []);

  const topScore = getLeader(players, "clashScore");
  const topWinrate = getLeader(players, "clashWinrate");
  const topKda = getLeader(players, "clashKda");
  const topDamage = getLeader(players, "avgDamage");
  const topPentas = getLeader(players, "pentakills");

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-black">Clash Tracker</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Prestige stats for Clash games. Flex er hverdag. Clash er ære.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-bold hover:bg-zinc-700"
          >
            Flex Tracker
          </Link>

          <button
            onClick={refreshClash}
            disabled={loading}
            className="rounded-xl bg-purple-500 px-5 py-3 font-bold text-black hover:bg-purple-400 disabled:opacity-50"
          >
            {loading ? "Opdaterer..." : "Opdater Clash"}
          </button>
        </div>
      </div>

      {message && <p className="mb-4 text-sm text-zinc-400">{message}</p>}

      {players.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
          Ingen Clash games endnu. Tryk Opdater Clash efter et Clash game.
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <AwardCard
              title="Clash MVP"
              player={topScore}
              value={`${topScore?.clashScore ?? 0} score`}
              tone="purple"
            />

            <AwardCard
              title="Bedste winrate"
              player={topWinrate}
              value={`${topWinrate?.clashWinrate ?? 0}%`}
              tone="green"
            />

            <AwardCard
              title="Bedste KDA"
              player={topKda}
              value={topKda?.clashKda ?? 0}
              tone="blue"
            />

            <AwardCard
              title="Top damage"
              player={topDamage}
              value={`${(topDamage?.avgDamage ?? 0).toLocaleString()} dmg/game`}
              tone="yellow"
            />

            <AwardCard
              title="Pentakills"
              player={topPentas}
              value={`${topPentas?.pentakills ?? 0} pentas`}
              tone="red"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-zinc-900 text-zinc-300">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Spiller</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">W/L</th>
                  <th className="p-4">WR</th>
                  <th className="p-4">Games</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">KDA</th>
                  <th className="p-4">Damage</th>
                  <th className="p-4">Vision</th>
                  <th className="p-4">Pentas</th>
                </tr>
              </thead>

              <tbody>
                {players.map((p, index) => (
                  <tr
                    key={`${p.name}-${p.gameName}`}
                    className="border-t border-zinc-800 hover:bg-zinc-900/60"
                  >
                    <td className="p-4 text-xl font-bold">{index + 1}</td>

                    <td className="p-4">
                      <div className="text-lg font-bold">{p.name}</div>
                      <div className="text-sm text-zinc-500">
                        {p.gameName}#{p.tagLine}
                      </div>
                    </td>

                    <td className="p-4">
                      {p.mainRole} / {p.secondRole}
                    </td>

                    <td className="p-4">
                      {p.clashWins}W / {p.clashLosses}L
                    </td>

                    <td className="p-4 font-bold text-emerald-400">
                      {p.clashWinrate}%
                    </td>

                    <td className="p-4">{p.clashGames}</td>

                    <td className="p-4 font-bold text-purple-400">
                      {p.clashScore}
                    </td>

                    <td className="p-4 text-cyan-300">{p.clashKda}</td>

                    <td className="p-4">
                      {(p.avgDamage ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4">{p.avgVision}</td>

                    <td className="p-4 font-bold text-red-400">
                      {p.pentakills}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 space-y-6">
            {players.map((p) => (
              <div
                key={`clash-recent-${p.name}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div
                  onClick={() =>
                    setOpenPlayers((prev) => ({
                      ...prev,
                      [p.name]: !prev[p.name],
                    }))
                  }
                  className="flex cursor-pointer justify-between"
                >
                  <div>
                    <h2 className="text-2xl font-bold">{p.name}</h2>
                    <p className="text-sm text-zinc-500">
                      Clash match history
                    </p>
                  </div>

                  <div className="text-sm text-zinc-500">
                    {openPlayers[p.name] ? "Skjul" : "Vis"} ·{" "}
                    {p.recentMatches?.length ?? 0} games
                  </div>
                </div>

                {openPlayers[p.name] && (
                  <div className="mt-4 space-y-2">
                    {p.recentMatches.map((match: any, i: number) => (
                      <div
                        key={`${p.name}-clash-${i}`}
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

                        <div className="flex gap-6 text-sm">
                          <div className="font-bold text-purple-400">
                            {match.clashScore} pts
                          </div>
                          <div>{(match.damage ?? 0).toLocaleString()} dmg</div>
                          <div>{match.csMin} CS/min</div>
                          <div className="text-zinc-500">
                            {formatDate(match.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
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