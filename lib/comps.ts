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
    id: "no-comp",
    name: "Ingen comp",
    color: "red",
    priority: 0,
    roles: {
      top: [],
      jungle: [],
      mid: [],
      adc: [],
      support: [],
    },
  },
  {
    id: "malphite-amumu-samira-wombo",
    name: "Malphite / Amumu / Samira Wombo",
    color: "green",
    priority: 1,
    roles: {
      top: ["Malphite", "Zac", "Volibear", "Ornn"],
      jungle: ["Amumu", "Diana", "Volibear", "Udyr"],
      mid: ["Lissandra", "Orianna", "Veigar", "Fizz"],
      adc: ["Samira", "Kai'Sa", "Vayne", "Lucian"],
      support: ["Nautilus", "Pantheon", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "dive-bot-carry",
    name: "Dive Bot Carry",
    color: "green",
    priority: 2,
    roles: {
      top: ["Malphite", "Zac", "Volibear", "Viego"],
      jungle: ["Diana", "Amumu", "Udyr", "Volibear"],
      mid: ["Lissandra", "Fizz", "Ekko", "Veigar"],
      adc: ["Kai'Sa", "Samira", "Lucian", "Tristana"],
      support: ["Nautilus", "Pantheon", "Amumu"],
    },
  },
  {
    id: "protect-adc",
    name: "Protect ADC",
    color: "orange",
    priority: 3,
    roles: {
      top: ["Malphite", "Ornn", "Zac", "Volibear"],
      jungle: ["Amumu", "Volibear", "Udyr", "Zac"],
      mid: ["Veigar", "Lissandra", "Orianna", "Xerath"],
      adc: ["Vayne", "Kai'Sa", "Tristana", "Aphelios"],
      support: ["Nautilus", "Amumu", "Vel'Koz", "Pantheon"],
    },
  },
  {
    id: "draven-snowball",
    name: "Draven Snowball",
    color: "yellow",
    priority: 4,
    roles: {
      top: ["Malphite", "Volibear", "Zac", "Katarina"],
      jungle: ["Udyr", "Volibear", "Amumu", "Diana"],
      mid: ["Lissandra", "Fizz", "Veigar", "Ekko"],
      adc: ["Draven", "Lucian", "Samira", "Kai'Sa"],
      support: ["Nautilus", "Pantheon", "Amumu"],
    },
  },
  {
    id: "pick-catch",
    name: "Pick / Catch",
    color: "yellow",
    priority: 5,
    roles: {
      top: ["Malphite", "Zac", "Volibear", "Ornn"],
      jungle: ["Udyr", "Volibear", "Diana", "Amumu"],
      mid: ["Lissandra", "Veigar", "Fizz", "Xerath"],
      adc: ["Ashe", "Draven", "Vayne", "Kai'Sa"],
      support: ["Pantheon", "Nautilus", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "poke-velkoz",
    name: "Vel'Koz Poke",
    color: "orange",
    priority: 6,
    roles: {
      top: ["Malphite", "Ornn", "Zac", "Volibear"],
      jungle: ["Udyr", "Amumu", "Volibear", "Diana"],
      mid: ["Xerath", "Veigar", "Ezreal", "Lissandra"],
      adc: ["Ashe", "Vayne", "Aphelios", "Kai'Sa"],
      support: ["Vel'Koz", "Pantheon", "Nautilus"],
    },
  },
  {
    id: "chaos-reset",
    name: "Chaos / Reset Fight",
    color: "green",
    priority: 7,
    roles: {
      top: ["Viego", "Katarina", "Malphite", "Zac"],
      jungle: ["Diana", "Amumu", "Udyr", "Volibear"],
      mid: ["Fizz", "Ekko", "Lissandra", "Veigar"],
      adc: ["Samira", "Kai'Sa", "Draven", "Yunara"],
      support: ["Nautilus", "Pantheon", "Amumu"],
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