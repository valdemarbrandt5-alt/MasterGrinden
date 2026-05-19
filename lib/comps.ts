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
    id: "wombo-combo",
    name: "Wombo Combo",
    color: "green",
    priority: 1,
    roles: {
      top: ["Malphite", "Kennen", "Rumble", "Gnar", "Ornn"],
      jungle: ["Amumu", "Jarvan IV", "Diana", "Wukong", "Fiddlesticks"],
      mid: ["Orianna", "Yasuo", "Yone", "Neeko", "Lissandra"],
      adc: ["Miss Fortune", "Samira", "Nilah", "Aphelios", "Kai'Sa"],
      support: ["Rell", "Rakan", "Nautilus", "Leona", "Seraphine"],
    },
  },
  {
    id: "hard-dive",
    name: "Hard Dive",
    color: "green",
    priority: 2,
    roles: {
      top: ["Camille", "Renekton", "Jax", "Kled", "Ambessa"],
      jungle: ["Vi", "Nocturne", "Hecarim", "Jarvan IV", "Diana"],
      mid: ["Lissandra", "Sylas", "Akali", "Galio", "Yone"],
      adc: ["Kai'Sa", "Samira", "Nilah", "Tristana", "Lucian"],
      support: ["Nautilus", "Leona", "Rell", "Rakan", "Alistar"],
    },
  },
  {
    id: "skirmish-tempo",
    name: "Skirmish Tempo",
    color: "green",
    priority: 3,
    roles: {
      top: ["Aatrox", "Riven", "Irelia", "Gwen", "Kled"],
      jungle: ["Viego", "Bel'Veth", "Kindred", "Lee Sin", "Graves"],
      mid: ["Sylas", "Yone", "Akali", "Ekko", "Irelia"],
      adc: ["Kai'Sa", "Lucian", "Xayah", "Ezreal", "Kalista"],
      support: ["Rakan", "Nami", "Thresh", "Bard", "Renata Glasc"],
    },
  },
  {
    id: "early-snowball",
    name: "Early Snowball",
    color: "green",
    priority: 4,
    roles: {
      top: ["Renekton", "Darius", "Olaf", "Pantheon", "Sett"],
      jungle: ["Lee Sin", "Elise", "Nidalee", "Rek'Sai", "Xin Zhao"],
      mid: ["LeBlanc", "Talon", "Qiyana", "Akshan", "Pantheon"],
      adc: ["Draven", "Lucian", "Kalista", "Caitlyn", "Tristana"],
      support: ["Nautilus", "Leona", "Pyke", "Blitzcrank", "Rell"],
    },
  },
  {
    id: "pick-catch",
    name: "Pick / Catch",
    color: "yellow",
    priority: 5,
    roles: {
      top: ["Camille", "Renekton", "Poppy", "K'Sante", "Pantheon"],
      jungle: ["Vi", "Lee Sin", "Elise", "Rek'Sai", "Rengar"],
      mid: ["Ahri", "LeBlanc", "Twisted Fate", "Syndra", "Vex"],
      adc: ["Ashe", "Jhin", "Varus", "Caitlyn", "Draven"],
      support: ["Thresh", "Blitzcrank", "Pyke", "Bard", "Morgana"],
    },
  },
  {
    id: "front-to-back-scaling",
    name: "Front-to-back Scaling",
    color: "yellow",
    priority: 6,
    roles: {
      top: ["Ornn", "Sion", "K'Sante", "Malphite", "Dr. Mundo"],
      jungle: ["Sejuani", "Zac", "Maokai", "Amumu", "Skarner"],
      mid: ["Orianna", "Azir", "Viktor", "Hwei", "Aurelion Sol"],
      adc: ["Jinx", "Aphelios", "Zeri", "Kog'Maw", "Smolder"],
      support: ["Lulu", "Milio", "Braum", "Janna", "Renata Glasc"],
    },
  },
  {
    id: "protect-hypercarry",
    name: "Protect Hypercarry",
    color: "orange",
    priority: 7,
    roles: {
      top: ["Shen", "Ornn", "Sion", "Poppy", "Tahm Kench"],
      jungle: ["Ivern", "Sejuani", "Zac", "Maokai", "Nunu & Willump"],
      mid: ["Lulu", "Orianna", "Seraphine", "Karma", "Zilean"],
      adc: ["Kog'Maw", "Jinx", "Aphelios", "Zeri", "Vayne"],
      support: ["Lulu", "Milio", "Janna", "Braum", "Renata Glasc"],
    },
  },
  
  
  
  
  {
    id: "double-ap",
    name: "Double AP Threat",
    color: "orange",
    priority: 8,
    roles: {
      top: ["Gwen", "Rumble", "Kennen", "Mordekaiser", "Vladimir"],
      jungle: ["Diana", "Lillia", "Karthus", "Fiddlesticks", "Taliyah"],
      mid: ["Syndra", "Viktor", "Hwei", "Orianna", "Azir"],
      adc: ["Varus", "Kai'Sa", "Ziggs", "Kog'Maw", "Ezreal"],
      support: ["Rell", "Nautilus", "Leona", "Karma", "Seraphine"],
    },
  },
  {
    id: "anti-dive-peel",
    name: "Anti-Dive Peel",
    color: "orange",
    priority: 9,
    roles: {
      top: ["Poppy", "Gragas", "Shen", "Malphite", "K'Sante"],
      jungle: ["Poppy", "Gragas", "Sejuani", "Ivern", "Trundle"],
      mid: ["Taliyah", "Vex", "Lissandra", "Galio", "Anivia"],
      adc: ["Xayah", "Sivir", "Ezreal", "Caitlyn", "Jinx"],
      support: ["Janna", "Milio", "Braum", "Taric", "Renata Glasc"],
    },
  },
  {
    id: "global-pick",
    name: "Global Pick",
    color: "orange",
    priority: 10,
    roles: {
      top: ["Shen", "Pantheon", "Kled", "Quinn", "Gangplank"],
      jungle: ["Nocturne", "Taliyah", "Rek'Sai", "Nunu & Willump", "Warwick"],
      mid: ["Twisted Fate", "Galio", "Ryze", "Pantheon", "Aurelion Sol"],
      adc: ["Ashe", "Jhin", "Ezreal", "Sivir", "Varus"],
      support: ["Bard", "Pyke", "Rakan", "Thresh", "Zilean"],
    },
  },
  {
    id: "poke-siege",
    name: "Poke Siege",
    color: "red",
    priority: 11,
    roles: {
      top: ["Jayce", "Gangplank", "Kennen", "Gnar", "Rumble"],
      jungle: ["Nidalee", "Graves", "Taliyah", "Karthus", "Lillia"],
      mid: ["Zoe", "Xerath", "Lux", "Hwei", "Jayce"],
      adc: ["Ezreal", "Varus", "Caitlyn", "Jhin", "Ziggs"],
      support: ["Karma", "Lux", "Zyra", "Xerath", "Vel'Koz"],
    },
  },
  {
    id: "splitpush-131",
    name: "1-3-1 Splitpush",
    color: "red",
    priority: 12,
    roles: {
      top: ["Fiora", "Jax", "Camille", "Tryndamere", "Yorick"],
      jungle: ["Nocturne", "Graves", "Kindred", "Kha'Zix", "Viego"],
      mid: ["Twisted Fate", "Ryze", "LeBlanc", "Akali", "Kassadin"],
      adc: ["Tristana", "Vayne", "Ezreal", "Kai'Sa", "Sivir"],
      support: ["Bard", "Janna", "Karma", "Zilean", "Tahm Kench"],
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