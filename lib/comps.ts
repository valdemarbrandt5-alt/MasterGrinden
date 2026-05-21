export type Role = "top" | "jungle" | "mid" | "adc" | "support";

export type TeamComp = {
  id: string;
  name: string;
  color: "green" | "yellow" | "orange" | "red";
  priority: number;
  roles: Record<Role, string[]>;
};
//s
export const roles: Role[] = ["top", "jungle", "mid", "adc", "support"];

export const roleLabels: Record<Role, string> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  adc: "ADC",
  support: "Support",
};

const allRoleChamps: Record<Role, string[]> = {
  top: ["Malphite", "Ornn", "Sion", "Shen", "Volibear"],
  jungle: ["Amumu", "Diana", "Udyr", "Volibear", "Zac"],
  mid: ["Lissandra", "Veigar", "Galio", "Fizz", "Xerath"],
  adc: ["Vayne", "Samira", "Draven", "Kai'Sa", "Lucian"],
  support: ["Nautilus", "Pantheon", "Vel'Koz", "Amumu", "Leona"],
};

export const comps: TeamComp[] = [
  {
    id: "no-comp",
    name: "Ingen comp",
    color: "red",
    priority: 0,
    roles: allRoleChamps,
  },
  {
    id: "wombo-engage",
    name: "Wombo Engage",
    color: "green",
    priority: 1,
    roles: {
      top: ["Malphite", "Ornn", "Sion", "Shen", "Volibear"],
      jungle: ["Amumu", "Diana", "Zac", "Volibear", "Udyr"],
      mid: ["Lissandra", "Galio", "Veigar", "Fizz", "Xerath"],
      adc: ["Samira", "Kai'Sa", "Vayne", "Lucian", "Draven"],
      support: ["Nautilus", "Amumu", "Leona", "Pantheon", "Vel'Koz"],
    },
  },
  {
    id: "dive-bot",
    name: "Dive Bot",
    color: "green",
    priority: 2,
    roles: {
      top: ["Malphite", "Shen", "Volibear", "Ornn", "Sion"],
      jungle: ["Diana", "Amumu", "Zac", "Volibear", "Udyr"],
      mid: ["Lissandra", "Galio", "Fizz", "Veigar", "Xerath"],
      adc: ["Kai'Sa", "Samira", "Lucian", "Vayne", "Draven"],
      support: ["Nautilus", "Leona", "Pantheon", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "protect-carry",
    name: "Protect Carry",
    color: "orange",
    priority: 3,
    roles: {
      top: ["Ornn", "Sion", "Shen", "Malphite", "Volibear"],
      jungle: ["Amumu", "Zac", "Udyr", "Volibear", "Diana"],
      mid: ["Veigar", "Galio", "Lissandra", "Xerath", "Fizz"],
      adc: ["Vayne", "Kai'Sa", "Lucian", "Samira", "Draven"],
      support: ["Nautilus", "Leona", "Amumu", "Pantheon", "Vel'Koz"],
    },
  },
  {
    id: "snowball-fight",
    name: "Snowball Fight",
    color: "yellow",
    priority: 4,
    roles: {
      top: ["Volibear", "Malphite", "Shen", "Ornn", "Sion"],
      jungle: ["Udyr", "Volibear", "Diana", "Amumu", "Zac"],
      mid: ["Fizz", "Lissandra", "Galio", "Veigar", "Xerath"],
      adc: ["Draven", "Lucian", "Samira", "Kai'Sa", "Vayne"],
      support: ["Pantheon", "Nautilus", "Leona", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "pick-catch",
    name: "Pick / Catch",
    color: "yellow",
    priority: 5,
    roles: {
      top: ["Malphite", "Shen", "Ornn", "Sion", "Volibear"],
      jungle: ["Udyr", "Volibear", "Diana", "Amumu", "Zac"],
      mid: ["Lissandra", "Veigar", "Galio", "Fizz", "Xerath"],
      adc: ["Ashe", "Draven", "Kai'Sa", "Lucian", "Vayne"],
      support: ["Pantheon", "Nautilus", "Leona", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "poke-catch",
    name: "Poke / Catch",
    color: "orange",
    priority: 6,
    roles: {
      top: ["Ornn", "Sion", "Malphite", "Shen", "Volibear"],
      jungle: ["Udyr", "Amumu", "Zac", "Volibear", "Diana"],
      mid: ["Xerath", "Veigar", "Galio", "Lissandra", "Fizz"],
      adc: ["Ashe", "Kai'Sa", "Lucian", "Vayne", "Draven"],
      support: ["Vel'Koz", "Pantheon", "Nautilus", "Leona", "Amumu"],
    },
  },
  {
    id: "front-to-back",
    name: "Front to Back",
    color: "orange",
    priority: 7,
    roles: {
      top: ["Ornn", "Sion", "Malphite", "Shen", "Volibear"],
      jungle: ["Zac", "Amumu", "Udyr", "Volibear", "Diana"],
      mid: ["Veigar", "Galio", "Lissandra", "Xerath", "Fizz"],
      adc: ["Vayne", "Kai'Sa", "Lucian", "Samira", "Draven"],
      support: ["Nautilus", "Leona", "Amumu", "Pantheon", "Vel'Koz"],
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