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
  top: ["Malphite", "Ornn", "Sion", "Shen", "Volibear"],
  jungle: ["Amumu", "Diana", "Udyr", "Volibear", "Zac"],
  mid: ["Lissandra", "Veigar", "Galio", "Fizz", "Xerath"],
  adc: ["Vayne", "Samira", "Draven", "Kai'Sa", "Lucian"],
  support: ["Nautilus", "Pantheon", "Vel'Koz", "Amumu", "Leona"],
};

export const comps: TeamComp[] = [
  {
    id: "wombo-engage",
    name: "Wombo Engage",
    color: "green",
    priority: 1,
    roles: {
      top: ["Malphite", "Ornn", "Sion", "Volibear", "Shen"],
      jungle: ["Amumu", "Diana", "Zac", "Volibear", "Udyr"],
      mid: ["Lissandra", "Galio", "Veigar", "Fizz", "Xerath"],
      adc: ["Samira", "Kai'Sa", "Vayne", "Lucian", "Draven"],
      support: ["Nautilus", "Leona", "Amumu", "Pantheon", "Vel'Koz"],
    },
  },
  {
    id: "dive-bot",
    name: "Dive Bot",
    color: "green",
    priority: 2,
    roles: {
      top: ["Shen", "Malphite", "Volibear", "Ornn", "Sion"],
      jungle: ["Diana", "Zac", "Amumu", "Volibear", "Udyr"],
      mid: ["Lissandra", "Galio", "Fizz", "Veigar", "Xerath"],
      adc: ["Kai'Sa", "Samira", "Lucian", "Vayne", "Draven"],
      support: ["Nautilus", "Leona", "Pantheon", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "front-to-back",
    name: "Front to Back",
    color: "green",
    priority: 3,
    roles: {
      top: ["Ornn", "Sion", "Malphite", "Shen", "Volibear"],
      jungle: ["Zac", "Amumu", "Udyr", "Volibear", "Diana"],
      mid: ["Veigar", "Galio", "Lissandra", "Xerath", "Fizz"],
      adc: ["Vayne", "Kai'Sa", "Lucian", "Samira", "Draven"],
      support: ["Nautilus", "Leona", "Amumu", "Pantheon", "Vel'Koz"],
    },
  },
  {
    id: "protect-carry",
    name: "Protect Carry",
    color: "yellow",
    priority: 4,
    roles: {
      top: ["Ornn", "Shen", "Sion", "Malphite", "Volibear"],
      jungle: ["Amumu", "Zac", "Udyr", "Volibear", "Diana"],
      mid: ["Veigar", "Galio", "Lissandra", "Xerath", "Fizz"],
      adc: ["Vayne", "Kai'Sa", "Lucian", "Samira", "Draven"],
      support: ["Nautilus", "Leona", "Amumu", "Pantheon", "Vel'Koz"],
    },
  },
  {
    id: "split-push",
    name: "Split Push",
    color: "yellow",
    priority: 5,
    roles: {
      top: ["Shen", "Volibear", "Malphite", "Sion", "Ornn"],
      jungle: ["Udyr", "Volibear", "Diana", "Zac", "Amumu"],
      mid: ["Fizz", "Lissandra", "Galio", "Veigar", "Xerath"],
      adc: ["Vayne", "Lucian", "Kai'Sa", "Draven", "Samira"],
      support: ["Pantheon", "Nautilus", "Leona", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "scaling",
    name: "Scaling",
    color: "yellow",
    priority: 6,
    roles: {
      top: ["Ornn", "Sion", "Shen", "Malphite", "Volibear"],
      jungle: ["Zac", "Amumu", "Udyr", "Volibear", "Diana"],
      mid: ["Veigar", "Xerath", "Galio", "Lissandra", "Fizz"],
      adc: ["Vayne", "Kai'Sa", "Samira", "Lucian", "Draven"],
      support: ["Nautilus", "Leona", "Vel'Koz", "Amumu", "Pantheon"],
    },
  },
  {
    id: "pick-catch",
    name: "Pick / Catch",
    color: "orange",
    priority: 7,
    roles: {
      top: ["Shen", "Malphite", "Ornn", "Volibear", "Sion"],
      jungle: ["Udyr", "Volibear", "Diana", "Amumu", "Zac"],
      mid: ["Lissandra", "Veigar", "Galio", "Fizz", "Xerath"],
      adc: ["Ashe", "Kai'Sa", "Lucian", "Draven", "Vayne"],
      support: ["Pantheon", "Nautilus", "Leona", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "skirmish",
    name: "Skirmish",
    color: "orange",
    priority: 8,
    roles: {
      top: ["Volibear", "Shen", "Malphite", "Ornn", "Sion"],
      jungle: ["Udyr", "Diana", "Volibear", "Amumu", "Zac"],
      mid: ["Fizz", "Lissandra", "Galio", "Veigar", "Xerath"],
      adc: ["Lucian", "Draven", "Kai'Sa", "Samira", "Vayne"],
      support: ["Pantheon", "Nautilus", "Leona", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "siege-poke",
    name: "Siege / Poke",
    color: "orange",
    priority: 9,
    roles: {
      top: ["Ornn", "Sion", "Malphite", "Shen", "Volibear"],
      jungle: ["Udyr", "Zac", "Amumu", "Volibear", "Diana"],
      mid: ["Xerath", "Veigar", "Galio", "Lissandra", "Fizz"],
      adc: ["Ashe", "Kai'Sa", "Lucian", "Vayne", "Draven"],
      support: ["Vel'Koz", "Pantheon", "Nautilus", "Leona", "Amumu"],
    },
  },
  {
    id: "snowball-fight",
    name: "Snowball Fight",
    color: "red",
    priority: 10,
    roles: {
      top: ["Volibear", "Malphite", "Shen", "Ornn", "Sion"],
      jungle: ["Udyr", "Volibear", "Diana", "Amumu", "Zac"],
      mid: ["Fizz", "Lissandra", "Galio", "Veigar", "Xerath"],
      adc: ["Draven", "Lucian", "Samira", "Kai'Sa", "Vayne"],
      support: ["Pantheon", "Nautilus", "Leona", "Amumu", "Vel'Koz"],
    },
  },
  {
    id: "anti-dive",
    name: "Anti Dive",
    color: "red",
    priority: 11,
    roles: {
      top: ["Shen", "Ornn", "Malphite", "Sion", "Volibear"],
      jungle: ["Amumu", "Zac", "Udyr", "Volibear", "Diana"],
      mid: ["Galio", "Veigar", "Lissandra", "Xerath", "Fizz"],
      adc: ["Vayne", "Kai'Sa", "Lucian", "Samira", "Draven"],
      support: ["Nautilus", "Leona", "Amumu", "Vel'Koz", "Pantheon"],
    },
  },
  {
    id: "no-comp",
    name: "Ingen comp",
    color: "red",
    priority: 12,
    roles: allRoleChamps,
  },
];