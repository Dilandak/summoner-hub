import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import type { LiveGame } from '@summoner-hub/types'

const app = new Hono()

app.get('/:puuid', async (c) => {
  const puuid = c.req.param('puuid')

  try {
    const data = await riotGet<LiveGame>(
      riotUrl.liveGameByPuuid(puuid)
    )

    return c.json({ data, cached: false, inGame: true })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status

    if (status === 404) {
      return c.json({ data: null, inGame: false })
    }

    console.error('Error fetching live game:', {
      status,
      puuid,
    })

    return c.json(
      {
        error: 'Error fetching live game',
        status,
      },
      500
    )
  }
})

export default app