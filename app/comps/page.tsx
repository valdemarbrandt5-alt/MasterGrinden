"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { comps, roleLabels, roles, type Role } from "@/lib/comps";
import { championIcon } from "@/lib/championIcons";
import { getPossibleComps, getRecommendedPicks } from "@/lib/compLogic";

const colorClasses = {
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  yellow: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function CompsPage() {
  const [selectedCompId, setSelectedCompId] = useState(comps[0].id);
  const [selectedRole, setSelectedRole] = useState<Role>("top");
  const [picked, setPicked] = useState<Partial<Record<Role, string>>>({});
  const [banned, setBanned] = useState<string[]>([]);

  const selectedComp = comps.find((c) => c.id === selectedCompId) ?? comps[0];

  const possibleComps = useMemo(() => {
    return getPossibleComps(picked);
  }, [picked]);

  const recommendedPicks = useMemo(() => {
    return getRecommendedPicks({
      selectedCompId,
      picked,
      banned,
    });
  }, [selectedCompId, picked, banned]);

  const missingRoles = roles.filter((role) => !picked[role]);

  function toggleBan(champ: string) {
    setBanned((prev) =>
      prev.includes(champ) ? prev.filter((c) => c !== champ) : [...prev, champ]
    );

    setPicked((prev) => {
      const copy = { ...prev };

      for (const role of roles) {
        if (copy[role] === champ) delete copy[role];
      }

      return copy;
    });
  }

  function pickChampion(role: Role, champ: string) {
    if (banned.includes(champ)) return;

    setPicked((prev) => ({
      ...prev,
      [role]: prev[role] === champ ? undefined : champ,
    }));
  }

  function clearDraft() {
    setPicked({});
    setBanned([]);
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-black">Team Comp Builder</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vælg comp, picks og bans. Så viser den hvad der stadig passer.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl bg-zinc-800 px-5 py-3 font-bold text-zinc-200 hover:bg-zinc-700"
        >
          Tilbage til tracker
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Comps</h2>

            <button
              onClick={clearDraft}
              className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/25"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {comps.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left font-bold transition ${
                  selectedCompId === comp.id
                    ? colorClasses[comp.color]
                    : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{comp.name}</span>
                  <span className="text-xs opacity-60">#{comp.priority}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div
            className={`rounded-2xl border p-6 ${
              colorClasses[selectedComp.color]
            }`}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm opacity-80">Valgt comp</div>
                <h2 className="text-4xl font-black">{selectedComp.name}</h2>
              </div>

              <div className="text-sm text-zinc-300">
                Klik på champ = pick. Tryk Ban for at fjerne champen.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-xl px-4 py-3 font-bold ${
                  selectedRole === role
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-2xl font-black">
              {roleLabels[selectedRole]} picks
            </h3>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {selectedComp.roles[selectedRole].map((champ) => {
                const isPicked = picked[selectedRole] === champ;
                const isBanned = banned.includes(champ);

                return (
                  <div
                    key={champ}
                    className={`rounded-2xl border p-3 ${
                      isPicked
                        ? "border-emerald-400 bg-emerald-500/10"
                        : isBanned
                        ? "border-red-500/40 bg-red-500/10 opacity-60"
                        : "border-zinc-800 bg-zinc-950"
                    }`}
                  >
                    <button
                      onClick={() => pickChampion(selectedRole, champ)}
                      className="flex w-full flex-col items-center gap-2"
                    >
                      <img
                        src={championIcon(champ)}
                        alt={champ}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <span className="text-center font-bold">{champ}</span>
                    </button>

                    <button
                      onClick={() => toggleBan(champ)}
                      className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-bold ${
                        isBanned
                          ? "bg-red-500 text-black"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {isBanned ? "Banned" : "Ban"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-2xl font-black">Draft plan</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {roles.map((role) => {
                const pickedChamp = picked[role];
                const options = selectedComp.roles[role].filter(
                  (champ) => !banned.includes(champ)
                );

                return (
                  <div
                    key={role}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-lg font-black">
                        {roleLabels[role]}
                      </div>

                      {pickedChamp && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">
                          LOCKED
                        </span>
                      )}
                    </div>

                    {pickedChamp ? (
                      <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <img
                          src={championIcon(pickedChamp)}
                          alt={pickedChamp}
                          className="h-12 w-12 rounded-lg"
                        />
                        <div>
                          <div className="font-black text-emerald-300">
                            {pickedChamp}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Valgt pick
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-500">
                        Ikke valgt endnu
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-zinc-500">
                        Muligheder
                      </div>

                      {options.length > 0 ? (
                        options.map((champ) => (
                          <button
                            key={champ}
                            onClick={() => pickChampion(role, champ)}
                            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-800 ${
                              pickedChamp === champ
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-zinc-900 text-zinc-300"
                            }`}
                          >
                            <img
                              src={championIcon(champ)}
                              alt={champ}
                              className="h-8 w-8 rounded-md"
                            />
                            <span className="font-bold">{champ}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-red-400">
                          Alle muligheder er banned.
                        </div>
                      )}
                    </div>

                    {banned.length > 0 && (
                      <div className="mt-4 border-t border-zinc-800 pt-3">
                        <div className="text-xs font-bold uppercase text-zinc-500">
                          Banned fra denne rolle
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedComp.roles[role]
                            .filter((champ) => banned.includes(champ))
                            .map((champ) => (
                              <span
                                key={champ}
                                className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-bold text-red-400"
                              >
                                {champ}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-4 text-2xl font-black">Draft lige nu</h3>

              <div className="space-y-3">
                {roles.map((role) => {
                  const champ = picked[role];

                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                    >
                      <div>
                        <div className="text-sm text-zinc-500">
                          {roleLabels[role]}
                        </div>
                        <div className="text-lg font-bold">
                          {champ ?? "Ikke valgt"}
                        </div>
                      </div>

                      {champ && (
                        <img
                          src={championIcon(champ)}
                          alt={champ}
                          className="h-12 w-12 rounded-lg"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-4 text-2xl font-black">Mulige comps</h3>

              <div className="space-y-3">
                {possibleComps.slice(0, 6).map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`w-full rounded-xl border p-4 text-left ${
                      colorClasses[comp.color]
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-black">{comp.name}</div>
                      <div className="text-xl font-black">{comp.score}%</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-2xl font-black">Bedste næste picks</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedPicks.slice(0, 9).map((rec) => (
                <button
                  key={`${rec.role}-${rec.champion}`}
                  onClick={() => pickChampion(rec.role, rec.champion)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={championIcon(rec.champion)}
                      alt={rec.champion}
                      className="h-14 w-14 rounded-xl"
                    />

                    <div>
                      <div className="text-lg font-black">{rec.champion}</div>
                      <div className="text-sm text-zinc-500">
                        {roleLabels[rec.role]} · {rec.score} score
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-zinc-400">
                    {rec.reasons.slice(0, 2).map((reason) => (
                      <div key={reason}>• {reason}</div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-2xl font-black">
              Forslag pr. manglende rolle
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {missingRoles.map((role) => {
                const options = selectedComp.roles[role].filter(
                  (champ) => !banned.includes(champ)
                );

                return (
                  <div
                    key={role}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="mb-3 font-black">{roleLabels[role]}</div>

                    <div className="space-y-2">
                      {options.length > 0 ? (
                        options.map((champ) => (
                          <button
                            key={champ}
                            onClick={() => pickChampion(role, champ)}
                            className="flex w-full items-center gap-3 rounded-lg bg-zinc-900 p-2 text-left hover:bg-zinc-800"
                          >
                            <img
                              src={championIcon(champ)}
                              alt={champ}
                              className="h-9 w-9 rounded-md"
                            />
                            <span className="font-bold">{champ}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-red-400">
                          Alle forslag banned. Rip draft.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}