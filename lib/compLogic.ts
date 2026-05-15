import { comps, roles, type Role } from "@/lib/comps";

export type DraftState = Partial<Record<Role, string>>;

export function getCompScore(compId: string, picked: DraftState) {
  const comp = comps.find((c) => c.id === compId);
  if (!comp) return 0;

  let totalPicked = 0;
  let matchingPicks = 0;

  for (const role of roles) {
    const champ = picked[role];
    if (!champ) continue;

    totalPicked++;

    if (comp.roles[role].includes(champ)) {
      matchingPicks++;
    }
  }

  if (totalPicked === 0) return 100;

  return Math.round((matchingPicks / totalPicked) * 100);
}

export function getPossibleComps(picked: DraftState) {
  return comps
    .map((comp) => ({
      ...comp,
      score: getCompScore(comp.id, picked),
    }))
    .filter((comp) => comp.score > 0)
    .sort((a, b) => b.score - a.score || a.priority - b.priority);
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
  const selectedComp = comps.find((c) => c.id === selectedCompId);
  if (!selectedComp) return [];

  const recommendations: {
    role: Role;
    champion: string;
    score: number;
    reasons: string[];
  }[] = [];

  for (const role of roles) {
    if (picked[role]) continue;

    for (const champion of selectedComp.roles[role]) {
      if (banned.includes(champion)) continue;

      let score = 50;
      const reasons: string[] = [];

      score += 20;
      reasons.push("Passer til valgt comp");

      const simulatedDraft = {
        ...picked,
        [role]: champion,
      };

      const possibleComps = getPossibleComps(simulatedDraft);
      const bestCompScore = possibleComps[0]?.score ?? 0;

      score += Math.round(bestCompScore / 4);

      if (bestCompScore >= 80) {
        reasons.push("Holder draften meget clean");
      } else if (bestCompScore >= 60) {
        reasons.push("Holder flere comps åbne");
      }

      const pickedChampions = Object.values(picked).filter(Boolean);

      if (
        pickedChampions.some((c) =>
          ["Malphite", "Jarvan IV", "Amumu", "Diana", "Orianna"].includes(c)
        ) &&
        ["Orianna", "Diana", "Samira", "Kai'Sa", "Nautilus", "Leona"].includes(
          champion
        )
      ) {
        score += 15;
        reasons.push("God wombo synergy");
      }

      if (
        pickedChampions.some((c) =>
          ["Vi", "Nocturne", "Hecarim", "Diana"].includes(c)
        ) &&
        ["Kai'Sa", "Samira", "Lissandra", "Sylas", "Nautilus"].includes(champion)
      ) {
        score += 12;
        reasons.push("God dive follow-up");
      }

      if (
        pickedChampions.some((c) =>
          ["Ornn", "Sion", "Sejuani", "Zac"].includes(c)
        ) &&
        ["Vayne", "Kai'Sa", "Tristana", "Orianna", "Azir"].includes(champion)
      ) {
        score += 10;
        reasons.push("God front-to-back scaling");
      }

      recommendations.push({
        role,
        champion,
        score,
        reasons,
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}