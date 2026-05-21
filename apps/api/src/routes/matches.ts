import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import type { MatchSummary } from '@summoner-hub/types'

const app = new Hono()

// GET /api/matches/:puuid?count=10
app.get('/:puuid', async (c) => {
  const puuid    = c.req.param('puuid')
  const count    = Number(c.req.query('count') || 10)
  const cacheKey = `matches:${puuid}:${count}`

  const cached = cacheGet<MatchSummary[]>(cacheKey)
  if (cached) return c.json({ data: cached, cached: true })

  try {
    const ids     = await riotGet<string[]>(riotUrl.matchIds(puuid, count))
    const matches = await Promise.all(ids.map(id => riotGet<MatchSummary>(riotUrl.match(id))))
    cacheSet(cacheKey, matches, 3 * 60 * 1000) // 3 min
    return c.json({ data: matches, cached: false })
  } catch (err) {
    return c.json({ error: 'Error fetching matches', details: String(err) }, 500)
  }
})

export default app
