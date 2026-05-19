export const roles = ["top", "jungle", "mid", "bot", "support"] as const;
export type Role = (typeof roles)[number];

type Comp = {
  id: string;
  name: string;
  category: string;
  priority: number;
  roles: Record<Role, string[]>;
};

const r = (
  top: string[],
  jungle: string[],
  mid: string[],
  bot: string[],
  support: string[]
): Record<Role, string[]> => ({ top, jungle, mid, bot, support });

export const comps: Comp[] = [
  {
    id: "front-to-back-scaling",
    name: "Front-to-back Scaling",
    category: "Scaling teamfight",
    priority: 1,
    roles: r(
      ["Ornn", "Sion", "K'Sante", "Malphite", "Dr. Mundo"],
      ["Sejuani", "Zac", "Maokai", "Amumu", "Skarner"],
      ["Orianna", "Azir", "Viktor", "Hwei", "Aurelion Sol"],
      ["Jinx", "Aphelios", "Zeri", "Kog'Maw", "Smolder"],
      ["Lulu", "Milio", "Braum", "Janna", "Renata Glasc"]
    ),
  },
  {
    id: "hard-dive",
    name: "Hard Dive",
    category: "Backline access",
    priority: 2,
    roles: r(
      ["Camille", "Renekton", "Jax", "Kled", "Ambessa"],
      ["Vi", "Nocturne", "Hecarim", "Jarvan IV", "Diana"],
      ["Lissandra", "Sylas", "Akali", "Galio", "Yone"],
      ["Kai'Sa", "Samira", "Nilah", "Tristana", "Lucian"],
      ["Nautilus", "Leona", "Rell", "Rakan", "Alistar"]
    ),
  },
  {
    id: "wombo-combo",
    name: "Wombo Combo",
    category: "AoE engage",
    priority: 3,
    roles: r(
      ["Malphite", "Kennen", "Rumble", "Gnar", "Ornn"],
      ["Amumu", "Jarvan IV", "Diana", "Wukong", "Fiddlesticks"],
      ["Orianna", "Yasuo", "Yone", "Neeko", "Lissandra"],
      ["Miss Fortune", "Samira", "Nilah", "Aphelios", "Kai'Sa"],
      ["Rell", "Rakan", "Nautilus", "Leona", "Seraphine"]
    ),
  },
  {
    id: "poke-siege",
    name: "Poke Siege",
    category: "Long range pressure",
    priority: 4,
    roles: r(
      ["Jayce", "Gangplank", "Kennen", "Gnar", "Rumble"],
      ["Nidalee", "Graves", "Taliyah", "Karthus", "Lillia"],
      ["Zoe", "Xerath", "Lux", "Hwei", "Jayce"],
      ["Ezreal", "Varus", "Caitlyn", "Jhin", "Ziggs"],
      ["Karma", "Lux", "Zyra", "Xerath", "Vel'Koz"]
    ),
  },
  {
    id: "pick-catch",
    name: "Pick / Catch",
    category: "Single target lockdown",
    priority: 5,
    roles: r(
      ["Camille", "Renekton", "Poppy", "K'Sante", "Pantheon"],
      ["Vi", "Lee Sin", "Elise", "Rek'Sai", "Rengar"],
      ["Ahri", "LeBlanc", "Twisted Fate", "Syndra", "Vex"],
      ["Ashe", "Jhin", "Varus", "Caitlyn", "Draven"],
      ["Thresh", "Blitzcrank", "Pyke", "Bard", "Morgana"]
    ),
  },
  {
    id: "splitpush-131",
    name: "1-3-1 Splitpush",
    category: "Side lane pressure",
    priority: 6,
    roles: r(
      ["Fiora", "Jax", "Camille", "Tryndamere", "Yorick"],
      ["Nocturne", "Graves", "Kindred", "Kha'Zix", "Viego"],
      ["Twisted Fate", "Ryze", "LeBlanc", "Akali", "Kassadin"],
      ["Tristana", "Vayne", "Ezreal", "Kai'Sa", "Sivir"],
      ["Bard", "Janna", "Karma", "Zilean", "Tahm Kench"]
    ),
  },
  {
    id: "protect-hypercarry",
    name: "Protect Hypercarry",
    category: "Peel / scaling ADC",
    priority: 7,
    roles: r(
      ["Shen", "Ornn", "Sion", "Poppy", "Tahm Kench"],
      ["Ivern", "Sejuani", "Zac", "Maokai", "Nunu & Willump"],
      ["Lulu", "Orianna", "Seraphine", "Karma", "Zilean"],
      ["Kog'Maw", "Jinx", "Aphelios", "Zeri", "Vayne"],
      ["Lulu", "Milio", "Janna", "Braum", "Renata Glasc"]
    ),
  },
  {
    id: "early-snowball",
    name: "Early Snowball",
    category: "Lane dominance",
    priority: 8,
    roles: r(
      ["Renekton", "Darius", "Olaf", "Pantheon", "Sett"],
      ["Lee Sin", "Elise", "Nidalee", "Rek'Sai", "Xin Zhao"],
      ["LeBlanc", "Talon", "Qiyana", "Akshan", "Pantheon"],
      ["Draven", "Lucian", "Kalista", "Caitlyn", "Tristana"],
      ["Nautilus", "Leona", "Pyke", "Blitzcrank", "Rell"]
    ),
  },
  {
    id: "skirmish-tempo",
    name: "Skirmish Tempo",
    category: "2v2 / 3v3 fights",
    priority: 9,
    roles: r(
      ["Aatrox", "Riven", "Irelia", "Gwen", "Kled"],
      ["Viego", "Bel'Veth", "Kindred", "Lee Sin", "Graves"],
      ["Sylas", "Yone", "Akali", "Ekko", "Irelia"],
      ["Kai'Sa", "Lucian", "Xayah", "Ezreal", "Kalista"],
      ["Rakan", "Nami", "Thresh", "Bard", "Renata Glasc"]
    ),
  },
  {
    id: "double-ap",
    name: "Double AP Threat",
    category: "Magic damage overload",
    priority: 10,
    roles: r(
      ["Gwen", "Rumble", "Kennen", "Mordekaiser", "Vladimir"],
      ["Diana", "Lillia", "Karthus", "Fiddlesticks", "Taliyah"],
      ["Syndra", "Viktor", "Hwei", "Orianna", "Azir"],
      ["Varus", "Kai'Sa", "Ziggs", "Kog'Maw", "Ezreal"],
      ["Rell", "Nautilus", "Leona", "Karma", "Seraphine"]
    ),
  },
  {
    id: "anti-dive-peel",
    name: "Anti-Dive Peel",
    category: "Disengage / punish engage",
    priority: 11,
    roles: r(
      ["Poppy", "Gragas", "Shen", "Malphite", "K'Sante"],
      ["Poppy", "Gragas", "Sejuani", "Ivern", "Trundle"],
      ["Taliyah", "Vex", "Lissandra", "Galio", "Anivia"],
      ["Xayah", "Sivir", "Ezreal", "Caitlyn", "Jinx"],
      ["Janna", "Milio", "Braum", "Taric", "Renata Glasc"]
    ),
  },
  {
    id: "global-pick",
    name: "Global Pick",
    category: "Map pressure",
    priority: 12,
    roles: r(
      ["Shen", "Pantheon", "Kled", "Quinn", "Gangplank"],
      ["Nocturne", "Taliyah", "Rek'Sai", "Nunu & Willump", "Warwick"],
      ["Twisted Fate", "Galio", "Ryze", "Pantheon", "Aurelion Sol"],
      ["Ashe", "Jhin", "Ezreal", "Sivir", "Varus"],
      ["Bard", "Pyke", "Rakan", "Thresh", "Zilean"]
    ),
  },
];