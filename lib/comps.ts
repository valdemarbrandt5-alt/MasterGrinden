export type Role = "top" | "jungle" | "mid" | "adc" | "support";

export type TeamComp = {
  id: string;
  name: string;
  color: "green" | "yellow" | "orange" | "red";
  priority: number;
  roles: Record<Role, string[]>;
};

export const roles: Role[] = ["top", "jungle", "mid", "adc", "support"];

export const roleLabels: Record<Role, string> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  adc: "ADC",
  support: "Support",
};

export const comps: TeamComp[] = [
  {
    id: "hard-engage-wombo",
    name: "Hard Engage / Wombo",
    color: "green",
    priority: 1,
    roles: {
      top: ["Malphite", "Ornn", "Sion"],
      jungle: ["Jarvan IV", "Vi", "Amumu"],
      mid: ["Diana", "Orianna", "Neeko"],
      adc: ["Kai'Sa", "Samira", "Tristana"],
      support: ["Nautilus", "Leona", "Pantheon"],
    },
  },
  {
    id: "dive-comp",
    name: "Dive Comp",
    color: "green",
    priority: 2,
    roles: {
      top: ["Malphite", "Kennen", "Gwen"],
      jungle: ["Vi", "Diana", "Hecarim"],
      mid: ["Diana", "Lissandra", "Sylas"],
      adc: ["Kai'Sa", "Samira", "Lucian"],
      support: ["Nautilus", "Leona", "Pantheon"],
    },
  },
  {
    id: "full-psycho-dive",
    name: "Full Psycho Dive",
    color: "green",
    priority: 3,
    roles: {
      top: ["Malphite", "Kennen", "Gwen"],
      jungle: ["Nocturne", "Vi", "Diana"],
      mid: ["Diana", "Katarina", "Sylas"],
      adc: ["Kai'Sa", "Samira", "Lucian"],
      support: ["Nautilus", "Leona", "Pantheon"],
    },
  },
  {
    id: "aoe-teamfight",
    name: "AoE Teamfight",
    color: "green",
    priority: 4,
    roles: {
      top: ["Malphite", "Kennen", "Ornn"],
      jungle: ["Amumu", "Jarvan IV", "Diana"],
      mid: ["Orianna", "Neeko", "Lissandra"],
      adc: ["Kai'Sa", "Samira", "Miss Fortune"],
      support: ["Nautilus", "Leona", "Pantheon"],
    },
  },
  {
    id: "reset-chaos-fight",
    name: "Reset / Chaos Fight",
    color: "yellow",
    priority: 5,
    roles: {
      top: ["Gwen", "Zaahen", "Mordekaiser"],
      jungle: ["Viego", "Diana", "Hecarim"],
      mid: ["Katarina", "Diana", "Sylas"],
      adc: ["Samira", "Kai'Sa", "Draven"],
      support: ["Nautilus", "Leona", "Pantheon"],
    },
  },
  {
    id: "skirmish-early-game",
    name: "Skirmish / Early Game",
    color: "yellow",
    priority: 6,
    roles: {
      top: ["Gwen", "Zaahen", "Olaf"],
      jungle: ["Viego", "Xin Zhao", "Vi"],
      mid: ["Sylas", "Ahri", "Katarina"],
      adc: ["Draven", "Lucian", "Samira"],
      support: ["Nautilus", "Leona", "Pantheon"],
    },
  },
  {
    id: "pick-catch-comp",
    name: "Pick / Catch Comp",
    color: "orange",
    priority: 7,
    roles: {
      top: ["Mordekaiser", "Kennen", "Malphite"],
      jungle: ["Hecarim", "Vi", "Jarvan IV"],
      mid: ["Ahri", "Annie", "Neeko"],
      adc: ["Lucian", "Miss Fortune", "Kai'Sa"],
      support: ["Pantheon", "Lux", "Nautilus"],
    },
  },
  {
    id: "scaling-comp",
    name: "Scaling Comp",
    color: "orange",
    priority: 8,
    roles: {
      top: ["Ornn", "Sion", "Cho'Gath"],
      jungle: ["Sejuani", "Jarvan IV", "Zac"],
      mid: ["Azir", "Orianna", "Annie"],
      adc: ["Vayne", "Kai'Sa", "Tristana"],
      support: ["Nautilus", "Leona", "Lux"],
    },
  },
  {
    id: "front-to-back-teamfight",
    name: "Front to Back Teamfight",
    color: "orange",
    priority: 9,
    roles: {
      top: ["Ornn", "Sion", "Mordekaiser"],
      jungle: ["Sejuani", "Jarvan IV", "Zac"],
      mid: ["Azir", "Orianna", "Annie"],
      adc: ["Tristana", "Kai'Sa", "Vayne"],
      support: ["Nautilus", "Leona", "Vel'Koz"],
    },
  },
  {
    id: "protect-carry",
    name: "Protect Carry",
    color: "red",
    priority: 10,
    roles: {
      top: ["Ornn", "Sion", "Malphite"],
      jungle: ["Sejuani", "Jarvan IV", "Vi"],
      mid: ["Orianna", "Annie", "Azir"],
      adc: ["Vayne", "Kai'Sa", "Tristana"],
      support: ["Nautilus", "Lux", "Vel'Koz"],
    },
  },
];

export function getCompsForChampion(champion: string) {
  return comps.filter((comp) =>
    roles.some((role) => comp.roles[role].includes(champion))
  );
}

export function getChampionsForCompAndRole(compId: string, role: Role) {
  const comp = comps.find((c) => c.id === compId);

  if (!comp) return [];

  return comp.roles[role];
}

export function getAllChampions() {
  const championSet = new Set<string>();

  for (const comp of comps) {
    for (const role of roles) {
      for (const champion of comp.roles[role]) {
        championSet.add(champion);
      }
    }
  }

  return Array.from(championSet).sort();
}