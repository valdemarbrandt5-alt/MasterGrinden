const DDRAGON_VERSION =
  process.env.NEXT_PUBLIC_DDRAGON_VERSION || "16.10.1";

const championIdMap: Record<string, string> = {
  "Cho'Gath": "Chogath",
  "Jarvan IV": "JarvanIV",
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  "Kog'Maw": "KogMaw",
  "LeBlanc": "Leblanc",
  "Lee Sin": "LeeSin",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Nunu & Willump": "Nunu",
  "Rek'Sai": "RekSai",
  "Renata Glasc": "Renata",
  "Tahm Kench": "TahmKench",
  "Twisted Fate": "TwistedFate",
  "Vel'Koz": "Velkoz",
  "Xin Zhao": "XinZhao",
  "Wukong": "MonkeyKing",
};

export function championId(name: string) {
  return championIdMap[name] ?? name.replace(/[^a-zA-Z0-9]/g, "");
}

export function championIcon(name: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId(
    name
  )}.png`;
}