import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import type { Summoner, RankedEntry } from '@summoner-hub/types'

type RiotAccount = {
  puuid: string
  gameName: string
  tagLine: string
}

const app = new Hono()

app.get('/', async (c) => {
  const gameName = c.req.query('gameName')
  const tagLine = c.req.query('tagLine')

  if (!gameName || !tagLine) {
    return c.json(
      { error: 'Faltan gameName y tagLine' },
      400
    )
  }

  const cacheKey = `summoner:${gameName.toLowerCase()}:${tagLine.toLowerCase()}`

  const cached = cacheGet<{
    account: RiotAccount
    summoner: Summoner
    ranked: RankedEntry[]
  }>(cacheKey)

  if (cached) return c.json({ data: cached, cached: true })

  try {
    const account = await riotGet<RiotAccount>(
      riotUrl.accountByRiotId(gameName, tagLine)
    )

    const summoner = await riotGet<Summoner>(
      riotUrl.summonerByPuuid(account.puuid)
    )

    const ranked = await riotGet<RankedEntry[]>(
      riotUrl.ranked(summoner.id)
    )

    const result = {
      account,
      summoner,
      ranked,
    }

    cacheSet(cacheKey, result, 5 * 60 * 1000)

    return c.json({ data: result, cached: false })
  } catch (err: unknown) {
    const status = (err as { response?: { status: number } })?.response?.status || 500
    console.error('Error fetching summoner:', err)

    return c.json(
      { error: 'Error fetching summoner' },
      status as 400
    )
  }
})

export default app