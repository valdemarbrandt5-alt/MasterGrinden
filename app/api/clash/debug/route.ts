import { NextResponse } from "next/server";
import { players } from "@/lib/players";
import { getAccount, getClashMatchIds, getMatch } from "@/lib/riot";

function getStatAccounts(player: any) {
  return player.statAccounts ?? [
    {
      gameName: player.gameName,
      tagLine: player.tagLine,
    },
  ];
}

export async function GET() {
  const result: any[] = [];

  for (const player of players) {
    for (const statAccount of getStatAccounts(player)) {
      try {
        const account = await getAccount(statAccount.gameName, statAccount.tagLine);
        const matchIds = await getClashMatchIds(account.puuid, 3);

        const matches = [];

        for (const id of matchIds) {
          try {
            const match = await getMatch(id);

            matches.push({
              matchId: id,
              queueId: match.info.queueId,
              minutes: Number((match.info.gameDuration / 60).toFixed(1)),
              created: new Date(match.info.gameCreation).toISOString(),
              participants: match.info.participants.map((p: any) => ({
                name: p.riotIdGameName ?? p.summonerName,
                tag: p.riotIdTagline,
                champion: p.championName,
                win: p.win,
              })),
            });
          } catch (error: any) {
            matches.push({
              matchId: id,
              error: error.message,
            });
          }
        }

        result.push({
          player: player.name,
          account: `${statAccount.gameName}#${statAccount.tagLine}`,
          matchIds,
          matches,
        });
      } catch (error: any) {
        result.push({
          player: player.name,
          account: `${statAccount.gameName}#${statAccount.tagLine}`,
          error: error.message,
        });
      }
    }
  }

  return NextResponse.json(result);
}