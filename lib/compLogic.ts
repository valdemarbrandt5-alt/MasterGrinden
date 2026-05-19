import { comps, roles, type Role } from "@/lib/comps";

export type DraftState = Partial<Record<Role, string>>;

type Recommendation = {
  role: Role;
  champion: string;
  score: number;
  reasons: string[];
};

function getPickedChampions(picked: DraftState) {
  return Object.values(picked).filter(Boolean) as string[];
}

function getCompById(compId: string) {
  return comps.find((comp) => comp.id === compId);
}

function championFitsCompRole(compId: string, role: Role, champion: string) {
  const comp = getCompById(compId);
  if (!comp) return false;

  return comp.roles[role].includes(champion);
}

export function getCompScore(compId: string, picked: DraftState) {
  const comp = getCompById(compId);
  if (!comp) return 0;

  let totalPicked = 0;
  let matchingPicks = 0;

  for (const role of roles) {
    const champion = picked[role];

    if (!champion) continue;

    totalPicked += 1;

    if (championFitsCompRole(compId, role, champion)) {
      matchingPicks += 1;
    }
  }

  if (totalPicked === 0) return 100;

  const rawScore = (matchingPicks / totalPicked) * 100;

  const priorityBonus = Math.max(0, 13 - Number(comp.priority ?? 12));

  return Math.min(100, Math.round(rawScore + priorityBonus));
}

export function getPossibleComps(picked: DraftState) {
  return comps
    .map((comp) => {
      let totalPicked = 0;
      let matchingPicks = 0;

      for (const role of roles) {
        const champion = picked[role];
        if (!champion) continue;

        totalPicked += 1;

        if (comp.roles[role].includes(champion)) {
          matchingPicks += 1;
        }
      }

      const score =
        totalPicked > 0
          ? Math.round((matchingPicks / totalPicked) * 100)
          : 100;

      return {
        ...comp,
        score,
        matchingPicks,
        totalPicked,
      };
    })
    .filter((comp) => comp.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.priority - b.priority;
    });
}

function getSynergyScore({
  selectedCompId,
  role,
  champion,
  picked,
}: {
  selectedCompId: string;
  role: Role;
  champion: string;
  picked: DraftState;
}) {
  const pickedChampions = getPickedChampions(picked);
  const selectedComp = getCompById(selectedCompId);

  let score = 0;
  const reasons: string[] = [];

  if (!selectedComp) {
    return { score, reasons };
  }

  if (selectedComp.roles[role].includes(champion)) {
    score += 30;
    reasons.push("Passer direkte til valgt comp");
  }

  const category = selectedComp.name.toLowerCase() + " " + selectedComp.id;

  if (
    category.includes("front") ||
    category.includes("scaling") ||
    category.includes("protect")
  ) {
    if (
      ["Ornn", "Sion", "K'Sante", "Sejuani", "Zac", "Maokai", "Braum"].some(
        (c) => pickedChampions.includes(c)
      ) &&
      ["Jinx", "Aphelios", "Zeri", "Kog'Maw", "Smolder", "Vayne"].includes(
        champion
      )
    ) {
      score += 18;
      reasons.push("God front-to-back carry");
    }

    if (
      ["Jinx", "Aphelios", "Zeri", "Kog'Maw", "Smolder", "Vayne"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Lulu", "Milio", "Janna", "Braum", "Renata Glasc", "Orianna"].includes(
        champion
      )
    ) {
      score += 18;
      reasons.push("God peel til carry");
    }
  }

  if (
    category.includes("dive") ||
    category.includes("backline") ||
    category.includes("hard-dive")
  ) {
    if (
      ["Vi", "Nocturne", "Hecarim", "Jarvan IV", "Diana", "Camille"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Kai'Sa", "Samira", "Nilah", "Tristana", "Lissandra", "Sylas"].includes(
        champion
      )
    ) {
      score += 18;
      reasons.push("God dive follow-up");
    }

    if (
      ["Kai'Sa", "Samira", "Nilah", "Tristana"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Vi", "Nocturne", "Hecarim", "Jarvan IV", "Diana", "Nautilus"].includes(
        champion
      )
    ) {
      score += 16;
      reasons.push("God backline adgang");
    }
  }

  if (
    category.includes("wombo") ||
    category.includes("aoe") ||
    category.includes("engage")
  ) {
    if (
      ["Malphite", "Amumu", "Jarvan IV", "Diana", "Rell", "Rakan"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Orianna", "Yasuo", "Yone", "Neeko", "Miss Fortune", "Samira"].includes(
        champion
      )
    ) {
      score += 20;
      reasons.push("Stærk wombo follow-up");
    }

    if (
      ["Orianna", "Yasuo", "Yone", "Neeko", "Miss Fortune", "Samira"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Malphite", "Amumu", "Jarvan IV", "Diana", "Rell", "Rakan"].includes(
        champion
      )
    ) {
      score += 18;
      reasons.push("God AoE engage setup");
    }
  }

  if (
    category.includes("poke") ||
    category.includes("siege") ||
    category.includes("range")
  ) {
    if (
      ["Jayce", "Zoe", "Xerath", "Lux", "Ezreal", "Varus", "Caitlyn"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Karma", "Lux", "Zyra", "Xerath", "Vel'Koz", "Jhin"].includes(champion)
    ) {
      score += 16;
      reasons.push("God poke pressure");
    }
  }

  if (
    category.includes("pick") ||
    category.includes("catch") ||
    category.includes("global")
  ) {
    if (
      ["Ahri", "Twisted Fate", "Ashe", "Jhin", "Thresh", "Blitzcrank"].some(
        (c) => pickedChampions.includes(c)
      ) &&
      ["Vi", "Lee Sin", "Elise", "Rek'Sai", "Rengar", "Pyke", "Bard"].includes(
        champion
      )
    ) {
      score += 16;
      reasons.push("God catch follow-up");
    }

    if (
      ["Nocturne", "Twisted Fate", "Galio", "Shen", "Pantheon"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Ashe", "Jhin", "Bard", "Pyke", "Rakan", "Taliyah"].includes(champion)
    ) {
      score += 16;
      reasons.push("God global pick synergy");
    }
  }

  if (
    category.includes("split") ||
    category.includes("1-3-1") ||
    category.includes("side")
  ) {
    if (
      ["Fiora", "Jax", "Camille", "Tryndamere", "Yorick"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Twisted Fate", "Ryze", "Nocturne", "Bard", "Janna", "Karma"].includes(
        champion
      )
    ) {
      score += 16;
      reasons.push("God side lane support");
    }
  }

  if (
    category.includes("snowball") ||
    category.includes("tempo") ||
    category.includes("skirmish")
  ) {
    if (
      ["Lee Sin", "Elise", "Nidalee", "Rek'Sai", "Viego", "Kindred"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Draven", "Lucian", "Kalista", "LeBlanc", "Talon", "Qiyana"].includes(
        champion
      )
    ) {
      score += 16;
      reasons.push("Stærk early tempo");
    }
  }

  if (
    category.includes("double") ||
    category.includes("magic") ||
    category.includes("ap")
  ) {
    if (
      ["Diana", "Lillia", "Karthus", "Fiddlesticks", "Taliyah"].some((c) =>
        pickedChampions.includes(c)
      ) &&
      ["Syndra", "Viktor", "Hwei", "Orianna", "Azir", "Ziggs"].includes(champion)
    ) {
      score += 16;
      reasons.push("Double AP pressure");
    }
  }

  if (reasons.length === 0) {
    reasons.push("Solidt comp fit");
  }

  return { score, reasons };
}

export function getRecommendedPicks({
  selectedCompId,
  picked,
  banned,
}: {
  selectedCompId: string;
  picked: DraftState;
  banned: string[];
}) {
  const selectedComp = getCompById(selectedCompId);

  if (!selectedComp) return [];

  const recommendations: Recommendation[] = [];

  for (const role of roles) {
    if (picked[role]) continue;

    for (const champion of selectedComp.roles[role]) {
      if (banned.includes(champion)) continue;

      const simulatedDraft = {
        ...picked,
        [role]: champion,
      };

      const possibleComps = getPossibleComps(simulatedDraft);
      const bestCompScore = possibleComps[0]?.score ?? 0;

      const synergy = getSynergyScore({
        selectedCompId,
        role,
        champion,
        picked,
      });

      const score = Math.min(
        100,
        45 + Math.round(bestCompScore / 4) + synergy.score
      );

      recommendations.push({
        role,
        champion,
        score,
        reasons: synergy.reasons,
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}