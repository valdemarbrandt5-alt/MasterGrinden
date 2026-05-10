const RIOT_API_KEY = process.env.RIOT_API_KEY;

const EUROPE = "https://europe.api.riotgames.com";
const EUW = "https://euw1.api.riotgames.com";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function riotFetch(url: string, retries = 2): Promise<any> {
  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY!,
    },
    cache: "no-store",
  });

  if (
    (res.status === 429 || res.status === 503 || res.status === 504) &&
    retries > 0
  ) {
    const waitMs = 5000;

    console.log(`Riot busy. Waiting ${waitMs / 1000}s...`);
    await sleep(waitMs);

    return riotFetch(url, retries - 1);
  }

  if (!res.ok) {
    const text = await res.text();
    console.log("RIOT ERROR:", res.status, text);
    console.log("FAILED URL:", url);
    throw new Error(`Riot API error: ${res.status}`);
  }

  await sleep(1000);

  return res.json();
}

export async function getAccount(gameName: string, tagLine: string) {
  return riotFetch(
    `${EUROPE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`
  );
}

export async function getRankByPuuid(puuid: string) {
  return riotFetch(`${EUW}/lol/league/v4/entries/by-puuid/${puuid}`);
}

export async function getFlexMatchIds(puuid: string, count = 1) {
  return riotFetch(
    `${EUROPE}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=440&type=ranked&start=0&count=${count}`
  );
}

export async function getMatch(matchId: string) {
  return riotFetch(`${EUROPE}/lol/match/v5/matches/${matchId}`);
}

export async function getClashMatchIds(puuid: string, count = 10) {
  return riotFetch(
    `${EUROPE}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`
  );
}