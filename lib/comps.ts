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

const allRoleChamps: Record<Role, string[]> = {
  top: [
    "Malphite",
    "Ornn",
    "Sion",
    "Shen",
    "Volibear",
    "Jax",
    "Fiora",
    "Camille",
    "Gwen",
    "K'Sante",
    "Mordekaiser",
  ],
  jungle: [
    "Amumu",
    "Diana",
    "Udyr",
    "Volibear",
    "Zac",
    "Jarvan IV",
    "Vi",
    "Sejuani",
    "Nocturne",
    "Kha'Zix",
    "Lee Sin",
  ],
  mid: [
    "Lissandra",
    "Veigar",
    "Galio",
    "Fizz",
    "Xerath",
    "Orianna",
    "Syndra",
    "Ahri",
    "Yone",
    "Azir",
    "Twisted Fate",
  ],
  adc: [
    "Vayne",
    "Samira",
    "Draven",
    "Kai'Sa",
    "Lucian",
    "Ashe",
    "Jinx",
    "Xayah",
    "Ezreal",
    "Caitlyn",
    "Sivir",
  ],
  support: [
    "Nautilus",
    "Pantheon",
    "Vel'Koz",
    "Amumu",
    "Leona",
    "Rakan",
    "Thresh",
    "Braum",
    "Lulu",
    "Milio",
    "Karma",
  ],
};

export const comps: TeamComp[] = [
  {
    id: "wombo-engage",
    name: "Wombo Engage",
    color: "green",
    priority: 1,
    roles: {
      top: ["Malphite", "Ornn", "K'Sante", "Sion"],
      jungle: ["Amumu", "Diana", "Jarvan IV", "Zac"],
      mid: ["Orianna", "Lissandra", "Galio", "Azir"],
      adc: ["Samira", "Kai'Sa", "Xayah", "Sivir"],
      support: ["Rakan", "Nautilus", "Leona", "Amumu"],
    },
  },
  {
    id: "front-to-back",
    name: "Front to Back",
    color: "green",
    priority: 2,
    roles: {
      top: ["Ornn", "Sion", "K'Sante", "Malphite"],
      jungle: ["Sejuani", "Zac", "Amumu", "Jarvan IV"],
      mid: ["Azir", "Orianna", "Veigar", "Syndra"],
      adc: ["Jinx", "Xayah", "Vayne", "Sivir"],
      support: ["Braum", "Lulu", "Milio", "Nautilus"],
    },
  },
  {
    id: "dive",
    name: "Dive",
    color: "green",
    priority: 3,
    roles: {
      top: ["Camille", "Volibear", "K'Sante", "Malphite"],
      jungle: ["Vi", "Nocturne", "Diana", "Jarvan IV"],
      mid: ["Lissandra", "Galio", "Ahri", "Yone"],
      adc: ["Kai'Sa", "Samira", "Lucian", "Xayah"],
      support: ["Nautilus", "Leona", "Rakan", "Pantheon"],
    },
  },
  {
    id: "protect-carry",
    name: "Protect Carry",
    color: "yellow",
    priority: 4,
    roles: {
      top: ["Shen", "Ornn", "Sion", "K'Sante"],
      jungle: ["Sejuani", "Zac", "Ivern", "Amumu"],
      mid: ["Galio", "Orianna", "Veigar", "Lissandra"],
      adc: ["Vayne", "Jinx", "Kog'Maw", "Aphelios"],
      support: ["Lulu", "Milio", "Braum", "Thresh"],
    },
  },
  {
    id: "pick-catch",
    name: "Pick / Catch",
    color: "yellow",
    priority: 5,
    roles: {
      top: ["Shen", "Camille", "Malphite", "K'Sante"],
      jungle: ["Vi", "Nocturne", "Kha'Zix", "Jarvan IV"],
      mid: ["Ahri", "Lissandra", "Twisted Fate", "Syndra"],
      adc: ["Ashe", "Jhin", "Caitlyn", "Varus"],
      support: ["Thresh", "Nautilus", "Pantheon", "Leona"],
    },
  },
  {
    id: "split-push",
    name: "Split Push",
    color: "yellow",
    priority: 6,
    roles: {
      top: ["Fiora", "Jax", "Camille", "Gwen"],
      jungle: ["Nocturne", "Lee Sin", "Udyr", "Vi"],
      mid: ["Twisted Fate", "Yone", "Ahri", "Fizz"],
      adc: ["Ezreal", "Kai'Sa", "Lucian", "Xayah"],
      support: ["Braum", "Thresh", "Rakan", "Karma"],
    },
  },
  {
    id: "siege-poke",
    name: "Siege / Poke",
    color: "orange",
    priority: 7,
    roles: {
      top: ["Jayce", "Gnar", "Ornn", "K'Sante"],
      jungle: ["Nidalee", "Lee Sin", "Jarvan IV", "Sejuani"],
      mid: ["Xerath", "Ziggs", "Syndra", "Jayce"],
      adc: ["Caitlyn", "Ezreal", "Varus", "Ashe"],
      support: ["Karma", "Lux", "Vel'Koz", "Milio"],
    },
  },
  {
    id: "snowball-fight",
    name: "Snowball Fight",
    color: "orange",
    priority: 8,
    roles: {
      top: ["Volibear", "Renekton", "Darius", "Mordekaiser"],
      jungle: ["Lee Sin", "Nidalee", "Diana", "Kha'Zix"],
      mid: ["Fizz", "Yone", "Ahri", "Syndra"],
      adc: ["Draven", "Lucian", "Samira", "Kai'Sa"],
      support: ["Pantheon", "Leona", "Nautilus", "Pyke"],
    },
  },
  {
    id: "anti-dive",
    name: "Anti Dive",
    color: "orange",
    priority: 9,
    roles: {
      top: ["Poppy", "Shen", "Ornn", "Malphite"],
      jungle: ["Poppy", "Sejuani", "Zac", "Amumu"],
      mid: ["Galio", "Lissandra", "Veigar", "Taliyah"],
      adc: ["Xayah", "Ezreal", "Sivir", "Kai'Sa"],
      support: ["Braum", "Janna", "Thresh", "Rakan"],
    },
  },
  {
    id: "full-scaling",
    name: "Full Scaling",
    color: "red",
    priority: 10,
    roles: {
      top: ["Kayle", "Gwen", "Ornn", "Sion"],
      jungle: ["Shyvana", "Karthus", "Zac", "Udyr"],
      mid: ["Azir", "Veigar", "Kassadin", "Aurelion Sol"],
      adc: ["Jinx", "Vayne", "Aphelios", "Kog'Maw"],
      support: ["Lulu", "Milio", "Braum", "Janna"],
    },
  },
  {
    id: "no-comp",
    name: "Ingen comp",
    color: "red",
    priority: 11,
    roles: allRoleChamps,
  },
];