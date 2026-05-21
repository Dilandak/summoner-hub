import axios from 'axios'

const RIOT_API_KEY = process.env.RIOT_API_KEY || ''
const REGION = process.env.RIOT_REGION || 'la1'         // la1 para LAS
const REGION_V5 = process.env.RIOT_REGION_V5 || 'americas'

const riotBase = axios.create({
  headers: { 'X-Riot-Token': RIOT_API_KEY },
  timeout: 10_000,
})

export const riotUrl = {
  summoner:  (name: string) =>
    `https://${REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
  ranked:    (summonerId: string) =>
    `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
  mastery:   (puuid: string, count = 10) =>
    `https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`,
  matchIds:  (puuid: string, count = 10) =>
    `https://${REGION_V5}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
  match:     (matchId: string) =>
    `https://${REGION_V5}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
  liveGame:  (summonerId: string) =>
    `https://${REGION}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${summonerId}`,
}

export async function riotGet<T>(url: string): Promise<T> {
  const res = await riotBase.get<T>(url)
  return res.data
}
