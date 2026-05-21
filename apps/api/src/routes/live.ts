import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import type { LiveGame } from '@summoner-hub/types'

const app = new Hono()

app.get('/:summonerId', async (c) => {
  const summonerId = c.req.param('summonerId')
  try {
    const data = await riotGet<LiveGame>(riotUrl.liveGame(summonerId))
    return c.json({ data, cached: false })
  } catch (err: unknown) {
    const status = (err as { response?: { status: number } })?.response?.status
    if (status === 404) return c.json({ data: null, inGame: false })
    return c.json({ error: 'Error fetching live game', details: String(err) }, 500)
  }
})

export default app
