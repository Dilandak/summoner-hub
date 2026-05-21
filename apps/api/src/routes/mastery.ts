import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import type { ChampionMastery } from '@summoner-hub/types'

const app = new Hono()

app.get('/:puuid', async (c) => {
  const puuid    = c.req.param('puuid')
  const count    = Number(c.req.query('count') || 10)
  const cacheKey = `mastery:${puuid}:${count}`

  const cached = cacheGet<ChampionMastery[]>(cacheKey)
  if (cached) return c.json({ data: cached, cached: true })

  try {
    const data = await riotGet<ChampionMastery[]>(riotUrl.mastery(puuid, count))
    cacheSet(cacheKey, data, 10 * 60 * 1000) // 10 min
    return c.json({ data, cached: false })
  } catch (err) {
    return c.json({ error: 'Error fetching mastery', details: String(err) }, 500)
  }
})

export default app
