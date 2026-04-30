export const TRACKING_START_TIME = Math.floor(
  new Date("2026-04-29T17:30:00").getTime() / 1000
);

export const RIOT_MATCH_SCAN_DEPTH = Number(
  process.env.RIOT_MATCH_SCAN_DEPTH || 1
);

export const RIOT_REQUEST_DELAY_MS = Number(
  process.env.RIOT_REQUEST_DELAY_MS || 2500
);