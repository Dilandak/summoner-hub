import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import type { Summoner, RankedEntry } from '@summoner-hub/types'

const app = new Hono()

// GET /api/summoner/:name
app.get('/:name', async (c) => {
  const name = c.req.param('name')
  const cacheKey = `summoner:${name.toLowerCase()}`

  const cached = cacheGet<{ summoner: Summoner; ranked: RankedEntry[] }>(cacheKey)
  if (cached) return c.json({ data: cached, cached: true })

  try {
    const summoner = await riotGet<Summoner>(riotUrl.summoner(name))
    const ranked   = await riotGet<RankedEntry[]>(riotUrl.ranked(summoner.id))
    const result   = { summoner, ranked }
    cacheSet(cacheKey, result, 5 * 60 * 1000) // 5 min
    return c.json({ data: result, cached: false })
  } catch (err: unknown) {
    const status = (err as { response?: { status: number } })?.response?.status || 500
    return c.json({ error: 'Error fetching summoner', details: String(err) }, status as 400)
  }
})

export default app
