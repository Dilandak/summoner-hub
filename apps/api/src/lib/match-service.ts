import type { MatchSummary } from '@summoner-hub/types'
import { cacheGet, cacheSet } from './cache.js'
import { riotGet, riotUrl } from './riot.js'

const inFlightMatches = new Map<string, Promise<MatchSummary>>()

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getMatchCached(matchId: string): Promise<MatchSummary> {
  const cacheKey = `match-detail:${matchId}`

  const cached = cacheGet<MatchSummary>(cacheKey)
  if (cached) return cached

  const inFlight = inFlightMatches.get(matchId)
  if (inFlight) return inFlight

  const request = riotGet<MatchSummary>(riotUrl.match(matchId))
    .then(match => {
      cacheSet(cacheKey, match, 10 * 60 * 1000)
      return match
    })
    .finally(() => {
      inFlightMatches.delete(matchId)
    })

  inFlightMatches.set(matchId, request)

  return request
}

export async function getMatchesByIds(matchIds: string[]) {
  const matches: MatchSummary[] = []
  const batchSize = 3

  for (let i = 0; i < matchIds.length; i += batchSize) {
    const batch = matchIds.slice(i, i + batchSize)

    const settled = await Promise.allSettled(
      batch.map(matchId => getMatchCached(matchId))
    )

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        matches.push(result.value)
      } else {
        console.warn('Partida omitida porque Riot falló o rate limitó una petición.')
      }
    }

    if (i + batchSize < matchIds.length) {
      await sleep(650)
    }
  }

  return matches
}