import 'dotenv/config'
import axios, { AxiosError } from 'axios'

function mustEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim() === '') {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value.trim()
}

const RIOT_API_KEY = mustEnv('RIOT_API_KEY')

const REGION = (process.env.RIOT_REGION || 'la1').trim().toLowerCase()
const REGION_V5 = (process.env.RIOT_REGION_V5 || 'americas').trim().toLowerCase()

// Delay global entre requests hacia Riot.
// Súbelo si sigues viendo 429. Ej: 250, 350, 500.
const RIOT_REQUEST_DELAY_MS = Number(process.env.RIOT_REQUEST_DELAY_MS || 220)

const RIOT_MAX_RETRIES = Number(process.env.RIOT_MAX_RETRIES || 3)

const riotBase = axios.create({
  headers: {
    'X-Riot-Token': RIOT_API_KEY,
  },
  timeout: 15_000,
})

function enc(value: string): string {
  return encodeURIComponent(value.trim())
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getRetryAfterMs(error: AxiosError): number {
  const retryAfter = error.response?.headers?.['retry-after']

  if (Array.isArray(retryAfter)) {
    const seconds = Number(retryAfter[0])
    return Number.isFinite(seconds) ? seconds * 1000 : 2500
  }

  if (typeof retryAfter === 'string') {
    const seconds = Number(retryAfter)
    return Number.isFinite(seconds) ? seconds * 1000 : 2500
  }

  return 2500
}

// Cola global para no bombardear Riot cuando varias rutas corren al mismo tiempo.
let riotQueue: Promise<unknown> = Promise.resolve()

function scheduleRiotRequest<T>(task: () => Promise<T>): Promise<T> {
  const run = riotQueue.then(async () => {
    await sleep(RIOT_REQUEST_DELAY_MS)
    return task()
  })

  riotQueue = run.catch(() => undefined)

  return run
}

export const riotUrl = {
  // Account-V1
  accountByRiotId: (gameName: string, tagLine: string) =>
    `https://${REGION_V5}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${enc(gameName)}/${enc(tagLine)}`,

  accountByPuuid: (puuid: string) =>
    `https://${REGION_V5}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${enc(puuid)}`,

  // Summoner-V4
  summonerByPuuid: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${enc(puuid)}`,

  // League-V4
  rankedByPuuid: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-puuid/${enc(puuid)}`,

  // Alias por si algún archivo viejo todavía usa riotUrl.ranked(...)
  ranked: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-puuid/${enc(puuid)}`,

  // Champion Mastery-V4
  mastery: (puuid: string, count = 10) =>
    `https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${enc(puuid)}/top?count=${count}`,

  masteryAll: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${enc(puuid)}`,

  masteryScore: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/scores/by-puuid/${enc(puuid)}`,

  // Match-V5
  matchIds: (puuid: string, count = 10) =>
    `https://${REGION_V5}.api.riotgames.com/lol/match/v5/matches/by-puuid/${enc(puuid)}/ids?start=0&count=${count}`,

  match: (matchId: string) =>
    `https://${REGION_V5}.api.riotgames.com/lol/match/v5/matches/${enc(matchId)}`,

  timeline: (matchId: string) =>
    `https://${REGION_V5}.api.riotgames.com/lol/match/v5/matches/${enc(matchId)}/timeline`,

  // Spectator-V5
  liveGameByPuuid: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${enc(puuid)}`,

  // Alias por si algún archivo viejo todavía usa riotUrl.liveGame(...)
  liveGame: (puuid: string) =>
    `https://${REGION}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${enc(puuid)}`,

  // Status
  status: () =>
    `https://${REGION}.api.riotgames.com/lol/status/v4/platform-data`,
}

export async function riotGet<T>(url: string): Promise<T> {
  return scheduleRiotRequest(async () => {
    let attempt = 1

    while (attempt <= RIOT_MAX_RETRIES + 1) {
      try {
        const res = await riotBase.get<T>(url)
        return res.data
      } catch (error) {
        const err = error as AxiosError
        const status = err.response?.status

        console.error('Riot API error:', {
          status,
          url,
          data: err.response?.data,
          attempt,
        })

        if (status === 429 && attempt <= RIOT_MAX_RETRIES) {
          const waitMs = getRetryAfterMs(err)

          console.warn(
            `Rate limit Riot. Reintentando en ${Math.round(waitMs / 1000)}s...`
          )

          await sleep(waitMs)
          attempt += 1
          continue
        }

        if (
          status &&
          status >= 500 &&
          attempt <= RIOT_MAX_RETRIES
        ) {
          const waitMs = 1200 * attempt

          console.warn(
            `Riot respondió ${status}. Reintentando en ${waitMs}ms...`
          )

          await sleep(waitMs)
          attempt += 1
          continue
        }

        throw err
      }
    }

    throw new Error(`Riot request failed after ${RIOT_MAX_RETRIES} retries`)
  })
}

export function getRiotConfigPreview() {
  return {
    region: REGION,
    regionV5: REGION_V5,
    requestDelayMs: RIOT_REQUEST_DELAY_MS,
    maxRetries: RIOT_MAX_RETRIES,
    apiKeyLoaded: Boolean(RIOT_API_KEY),
    apiKeyPreview: `${RIOT_API_KEY.slice(0, 8)}...`,
  }
}