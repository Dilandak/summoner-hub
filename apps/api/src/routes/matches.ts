import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import { getMatchesByIds } from '../lib/match-service.js'
import type { MatchSummary } from '@summoner-hub/types'

const app = new Hono()

app.get('/:puuid', async (c) => {
  const puuid = c.req.param('puuid')
  const countParam = Number(c.req.query('count') || 10)
  const count = Math.min(Math.max(countParam, 5), 50)

  const cacheKey = `matches:${puuid}:${count}`

  const cached = cacheGet<MatchSummary[]>(cacheKey)
  if (cached) return c.json({ data: cached, cached: true })

  try {
    const ids = await riotGet<string[]>(riotUrl.matchIds(puuid, count))
    const matches = await getMatchesByIds(ids)

    cacheSet(cacheKey, matches, 3 * 60 * 1000)

    return c.json({
      data: matches,
      cached: false,
      requested: ids.length,
      returned: matches.length,
    })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status || 500

    console.error('Error fetching matches:', {
      status,
      puuid,
      count,
    })

    return c.json(
      {
        error: 'Error fetching matches',
        status,
      },
      status as 400
    )
  }
})

export default app