import { comps, roles, type Role } from "@/lib/comps";

export type DraftState = Partial<Record<Role, string>>;

function realComps() {
  return comps.filter((comp) => comp.id !== "no-comp");
}

function getCompById(compId: string) {
  return comps.find((comp) => comp.id === compId);
}

export function getPossibleComps(picked: DraftState) {
  return realComps()
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
        totalPicked > 0 ? Math.round((matchingPicks / totalPicked) * 100) : 100;

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

export function getBestCompFromDraft(picked: DraftState) {
  const possible = getPossibleComps(picked);
  return possible[0] ?? realComps()[0];
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
  const selectedComp =
    selectedCompId === "no-comp"
      ? getBestCompFromDraft(picked)
      : getCompById(selectedCompId);

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

      const simulatedDraft = {
        ...picked,
        [role]: champion,
      };

      const possibleComps = getPossibleComps(simulatedDraft);
      const bestCompScore = possibleComps[0]?.score ?? 0;

      let score = 50 + Math.round(bestCompScore / 3);
      const reasons = [`Passer til ${selectedComp.name}`];

      const pickedChamps = Object.values(picked).filter(Boolean);

      if (
        pickedChamps.some((c) => ["Malphite", "Amumu", "Diana", "Zac"].includes(c)) &&
        ["Samira", "Kai'Sa", "Lissandra", "Nautilus", "Pantheon", "Amumu"].includes(champion)
      ) {
        score += 20;
        reasons.push("Stærk engage follow-up");
      }

      if (
        pickedChamps.some((c) => ["Samira", "Kai'Sa"].includes(c)) &&
        ["Malphite", "Amumu", "Diana", "Nautilus", "Pantheon", "Lissandra"].includes(champion)
      ) {
        score += 20;
        reasons.push("God setup til bot carry");
      }

      if (
        pickedChamps.some((c) => ["Vayne", "Aphelios", "Tristana"].includes(c)) &&
        ["Malphite", "Ornn", "Zac", "Amumu", "Veigar", "Nautilus"].includes(champion)
      ) {
        score += 15;
        reasons.push("God peel/frontline");
      }

      if (
        pickedChamps.some((c) => ["Draven", "Lucian"].includes(c)) &&
        ["Pantheon", "Nautilus", "Udyr", "Volibear", "Lissandra"].includes(champion)
      ) {
        score += 15;
        reasons.push("God snowball lane");
      }

      if (
        pickedChamps.some((c) => ["Vel'Koz", "Xerath", "Ashe"].includes(c)) &&
        ["Veigar", "Xerath", "Vel'Koz", "Ashe", "Pantheon"].includes(champion)
      ) {
        score += 12;
        reasons.push("God poke/catch");
      }

      recommendations.push({
        role,
        champion,
        score: Math.min(100, score),
        reasons,
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}