import {
  RIOT_MATCH_SCAN_DEPTH,
  RIOT_REQUEST_DELAY_MS,
  TRACKING_START_TIME,
} from "@/lib/trackerSettings";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const EUROPE = "https://europe.api.riotgames.com";
const EUW = "https://euw1.api.riotgames.com";

if (!RIOT_API_KEY) {
  throw new Error("Missing RIOT_API_KEY");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(res: Response) {
  const retryAfter = res.headers.get("Retry-After");

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);

  if (!Number.isFinite(seconds)) {
    return null;
  }

  return seconds * 1000;
}

export async function riotFetch(url: string, retries = 6): Promise<any> {
  let attempt = 0;

  while (true) {
    attempt++;

    const res = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY!,
      },
      cache: "no-store",
    });

    await sleep(RIOT_REQUEST_DELAY_MS);

    if (res.ok) {
      return res.json();
    }

    const retryable = [429, 500, 502, 503, 504].includes(res.status);

    if (!retryable || attempt > retries) {
      const text = await res.text().catch(() => "");
      console.log("RIOT ERROR:", res.status, text);
      console.log("FAILED URL:", url);
      throw new Error(`Riot API error: ${res.status}`);
    }

    const retryAfterMs = getRetryAfterMs(res);
    const backoffMs =
      retryAfterMs ?? Math.min(60000, 4000 * Math.pow(2, attempt - 1));

    console.log(
      `Riot unstable. Status ${res.status}. Retry ${attempt}/${retries}. Waiting ${
        backoffMs / 1000
      }s`
    );

    await sleep(backoffMs);
  }
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

export async function getFlexMatchIds(
  puuid: string,
  count = RIOT_MATCH_SCAN_DEPTH
) {
  return riotFetch(
    `${EUROPE}/lol/match/v5/matches/by-puuid/${puuid}/ids` +
      `?queue=440` +
      `&type=ranked` +
      `&start=0` +
      `&count=${count}` +
      `&startTime=${TRACKING_START_TIME}`
  );
}

export async function getMatch(matchId: string) {
  return riotFetch(`${EUROPE}/lol/match/v5/matches/${matchId}`);
}