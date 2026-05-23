import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import type { MatchSummary } from '@summoner-hub/types'
import { getMatchesByIds } from '../lib/match-service.js'


const app = new Hono()

type QueueStat = {
  queueId: number
  queueName: string
  games: number
  wins: number
  losses: number
  winRate: number
}

type BestGame = {
  matchId: string
  queueId: number
  queueName: string
  gameCreation: number
  win: boolean
  kills: number
  deaths: number
  assists: number
  kdaText: string
  damage: number
  cs: number
  gold: number
  vision: number
  score: number
}

export type ChampionStat = {
  championName: string
  games: number
  wins: number
  losses: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  kdaText: string
  avgCs: number
  avgDamage: number
  avgGold: number
  avgVision: number
  lastPlayedAt: number
  queues: QueueStat[]
  bestGame: BestGame | null
}

type ChampionAccumulator = {
  championName: string
  games: number
  wins: number
  kills: number
  deaths: number
  assists: number
  cs: number
  damage: number
  gold: number
  vision: number
  lastPlayedAt: number
  queues: Map<number, { queueId: number; games: number; wins: number }>
  bestGame: BestGame | null
}

type ParticipantExtra = MatchSummary['info']['participants'][number] & {
  visionScore?: number
  goldEarned?: number
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getQueueName(queueId: number): string {
  const queues: Record<number, string> = {
    420: 'Ranked Solo/Duo',
    440: 'Ranked Flex',
    400: 'Normal Draft',
    430: 'Normal Blind',
    450: 'ARAM',
    700: 'Clash',
    900: 'URF',
    1700: 'Arena',
  }

  return queues[queueId] ?? `Cola ${queueId}`
}

function round1(value: number) {
  return Number(value.toFixed(1))
}

function getAvg(value: number, games: number) {
  if (games <= 0) return 0
  return round1(value / games)
}

function getWinRate(wins: number, games: number) {
  if (games <= 0) return 0
  return round1((wins / games) * 100)
}

function getKdaText(kills: number, deaths: number, assists: number, games: number) {
  return `${getAvg(kills, games)} / ${getAvg(deaths, games)} / ${getAvg(assists, games)}`
}

function getGameScore(me: ParticipantExtra) {
  const cs = (me.totalMinionsKilled ?? 0) + (me.neutralMinionsKilled ?? 0)
  const damage = me.totalDamageDealtToChampions ?? 0
  const gold = me.goldEarned ?? 0
  const vision = me.visionScore ?? 0

  const kdaScore = (me.kills * 2.4) + (me.assists * 1.4) - (me.deaths * 1.8)
  const economyScore = cs * 0.08 + gold * 0.001
  const damageScore = damage * 0.0008
  const visionScore = vision * 0.35
  const winBonus = me.win ? 8 : 0

  return round1(kdaScore + economyScore + damageScore + visionScore + winBonus)
}

async function fetchMatchesInBatches(ids: string[]) {
  const matches: MatchSummary[] = []
  const batchSize = 5

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)

    const settled = await Promise.allSettled(
      batch.map(id => riotGet<MatchSummary>(riotUrl.match(id)))
    )

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        matches.push(result.value)
      } else {
        console.warn('Match skipped because Riot request failed')
      }
    }

    if (i + batchSize < ids.length) {
      await sleep(450)
    }
  }

  return matches
}

app.get('/:puuid', async (c) => {
  const puuid = c.req.param('puuid')
  const countParam = Number(c.req.query('count') || 80)
  const count = Math.min(Math.max(countParam, 10), 100)

  const cacheKey = `champion-stats:${puuid}:${count}`

  const cached = cacheGet<ChampionStat[]>(cacheKey)
  if (cached) return c.json({ data: cached, cached: true })

  try {
    const matchIds = await riotGet<string[]>(
      riotUrl.matchIds(puuid, count)
    )

    const matches = await getMatchesByIds(matchIds)
    const championMap = new Map<string, ChampionAccumulator>()

    for (const match of matches) {
      const me = match.info.participants.find(p => p.puuid === puuid) as ParticipantExtra | undefined
      if (!me) continue

      const info = match.info as MatchSummary['info'] & {
        gameEndTimestamp?: number
        gameStartTimestamp?: number
      }

      const championName = me.championName
      const queueId = match.info.queueId
      const cs = (me.totalMinionsKilled ?? 0) + (me.neutralMinionsKilled ?? 0)
      const damage = me.totalDamageDealtToChampions ?? 0
      const gold = me.goldEarned ?? 0
      const vision = me.visionScore ?? 0
      const gameCreation =
        info.gameEndTimestamp ??
        info.gameStartTimestamp ??
        info.gameCreation ??
        Date.now()

      const current = championMap.get(championName) ?? {
        championName,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        cs: 0,
        damage: 0,
        gold: 0,
        vision: 0,
        lastPlayedAt: 0,
        queues: new Map<number, { queueId: number; games: number; wins: number }>(),
        bestGame: null,
      }

      current.games += 1
      current.wins += me.win ? 1 : 0
      current.kills += me.kills
      current.deaths += me.deaths
      current.assists += me.assists
      current.cs += cs
      current.damage += damage
      current.gold += gold
      current.vision += vision
      current.lastPlayedAt = Math.max(current.lastPlayedAt, gameCreation)

      const queueCurrent = current.queues.get(queueId) ?? {
        queueId,
        games: 0,
        wins: 0,
      }

      queueCurrent.games += 1
      queueCurrent.wins += me.win ? 1 : 0
      current.queues.set(queueId, queueCurrent)

      const score = getGameScore(me)

      const bestGame: BestGame = {
        matchId: match.metadata.matchId,
        queueId,
        queueName: getQueueName(queueId),
        gameCreation,
        win: me.win,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        kdaText: `${me.kills} / ${me.deaths} / ${me.assists}`,
        damage,
        cs,
        gold,
        vision,
        score,
      }

      if (!current.bestGame || bestGame.score > current.bestGame.score) {
        current.bestGame = bestGame
      }

      championMap.set(championName, current)
    }

    const result: ChampionStat[] = [...championMap.values()]
      .map(champ => ({
        championName: champ.championName,
        games: champ.games,
        wins: champ.wins,
        losses: champ.games - champ.wins,
        winRate: getWinRate(champ.wins, champ.games),
        avgKills: getAvg(champ.kills, champ.games),
        avgDeaths: getAvg(champ.deaths, champ.games),
        avgAssists: getAvg(champ.assists, champ.games),
        kdaText: getKdaText(champ.kills, champ.deaths, champ.assists, champ.games),
        avgCs: getAvg(champ.cs, champ.games),
        avgDamage: Math.round(champ.damage / champ.games),
        avgGold: Math.round(champ.gold / champ.games),
        avgVision: getAvg(champ.vision, champ.games),
        lastPlayedAt: champ.lastPlayedAt,
        queues: [...champ.queues.values()]
          .map(q => ({
            queueId: q.queueId,
            queueName: getQueueName(q.queueId),
            games: q.games,
            wins: q.wins,
            losses: q.games - q.wins,
            winRate: getWinRate(q.wins, q.games),
          }))
          .sort((a, b) => b.games - a.games),
        bestGame: champ.bestGame,
      }))
      .sort((a, b) => {
        if (b.games !== a.games) return b.games - a.games
        return b.lastPlayedAt - a.lastPlayedAt
      })

    cacheSet(cacheKey, result, 3 * 60 * 1000)

    return c.json({ data: result, cached: false })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status || 500

    console.error('Error fetching champion stats:', {
      status,
      puuid,
    })

    return c.json(
      {
        error: 'Error fetching champion stats',
        status,
      },
      status as 400
    )
  }
})

export default app