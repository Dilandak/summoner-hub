import { Hono } from 'hono'
import { riotGet, riotUrl } from '../lib/riot.js'
import { cacheGet, cacheSet } from '../lib/cache.js'
import { getMatchesByIds } from '../lib/match-service.js'
import type { MatchSummary } from '@summoner-hub/types'

const app = new Hono()

type ParticipantExtra = MatchSummary['info']['participants'][number] & {
  puuid: string
  teamId: number
  championName: string
  riotIdGameName?: string
  riotIdTagline?: string
  summonerName?: string
  totalDamageDealtToChampions?: number
  kills: number
  deaths: number
  assists: number
  win: boolean
}

type FrequentTeammateAccumulator = {
  puuid: string
  displayName: string
  gameName?: string
  tagLine?: string
  games: number
  wins: number
  losses: number
  lastSeenAt: number
  lastChampion: string
  champions: Map<string, number>
  queues: Map<number, number>
  kills: number
  deaths: number
  assists: number
  damage: number
}

export type FrequentTeammate = {
  puuid: string
  displayName: string
  gameName?: string
  tagLine?: string
  games: number
  wins: number
  losses: number
  winRate: number
  lastSeenAt: number
  lastChampion: string
  mostPlayedChampion: string
  mostCommonQueue: string
  avgKdaText: string
  avgDamage: number
}

type FrequentTeammatesResponse = {
  puuid: string
  analyzedMatches: number
  teammates: FrequentTeammate[]
  lastUpdatedAt: string
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

function getDisplayName(player: ParticipantExtra) {
  if (player.riotIdGameName && player.riotIdTagline) {
    return `${player.riotIdGameName}#${player.riotIdTagline}`
  }

  if (player.summonerName) return player.summonerName

  return 'Jugador'
}

function getMostCommonString(map: Map<string, number>) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

function getMostCommonQueue(map: Map<number, number>) {
  const queueId = [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return queueId ? getQueueName(queueId) : '—'
}

function getWinRate(wins: number, games: number) {
  if (!games) return 0
  return Number(((wins / games) * 100).toFixed(1))
}

function getAvg(value: number, games: number) {
  if (!games) return 0
  return Number((value / games).toFixed(1))
}

function toFrequentTeammate(acc: FrequentTeammateAccumulator): FrequentTeammate {
  return {
    puuid: acc.puuid,
    displayName: acc.displayName,
    gameName: acc.gameName,
    tagLine: acc.tagLine,
    games: acc.games,
    wins: acc.wins,
    losses: acc.losses,
    winRate: getWinRate(acc.wins, acc.games),
    lastSeenAt: acc.lastSeenAt,
    lastChampion: acc.lastChampion,
    mostPlayedChampion: getMostCommonString(acc.champions),
    mostCommonQueue: getMostCommonQueue(acc.queues),
    avgKdaText: `${getAvg(acc.kills, acc.games)} / ${getAvg(acc.deaths, acc.games)} / ${getAvg(acc.assists, acc.games)}`,
    avgDamage: Math.round(acc.damage / acc.games),
  }
}

app.get('/:puuid', async (c) => {
  const puuid = c.req.param('puuid')
  const countParam = Number(c.req.query('count') || 40)
  const count = Math.min(Math.max(countParam, 10), 80)

  const cacheKey = `recent-players:${puuid}:${count}`

  const cached = cacheGet<FrequentTeammatesResponse>(cacheKey)
  if (cached) return c.json({ data: cached, cached: true })

  try {
    const matchIds = await riotGet<string[]>(riotUrl.matchIds(puuid, count))
    const matches = await getMatchesByIds(matchIds)

    const teammatesMap = new Map<string, FrequentTeammateAccumulator>()

    for (const match of matches) {
      const participants = match.info.participants as ParticipantExtra[]
      const me = participants.find(player => player.puuid === puuid)

      if (!me) continue

      const info = match.info as MatchSummary['info'] & {
        gameEndTimestamp?: number
        gameStartTimestamp?: number
      }

      const gameTime =
        info.gameEndTimestamp ??
        info.gameStartTimestamp ??
        info.gameCreation ??
        Date.now()

      const queueId = match.info.queueId

      for (const player of participants) {
        if (player.puuid === puuid) continue

        // Solo jugadores de tu mismo equipo.
        if (player.teamId !== me.teamId) continue

        const current = teammatesMap.get(player.puuid) ?? {
          puuid: player.puuid,
          displayName: getDisplayName(player),
          gameName: player.riotIdGameName,
          tagLine: player.riotIdTagline,
          games: 0,
          wins: 0,
          losses: 0,
          lastSeenAt: 0,
          lastChampion: player.championName,
          champions: new Map<string, number>(),
          queues: new Map<number, number>(),
          kills: 0,
          deaths: 0,
          assists: 0,
          damage: 0,
        }

        current.games += 1

        // Winrate juntos: si tú ganaste esa partida con él en tu equipo.
        if (me.win) current.wins += 1
        else current.losses += 1

        current.kills += player.kills
        current.deaths += player.deaths
        current.assists += player.assists
        current.damage += player.totalDamageDealtToChampions ?? 0

        current.champions.set(
          player.championName,
          (current.champions.get(player.championName) ?? 0) + 1
        )

        current.queues.set(
          queueId,
          (current.queues.get(queueId) ?? 0) + 1
        )

        if (gameTime >= current.lastSeenAt) {
          current.lastSeenAt = gameTime
          current.lastChampion = player.championName
          current.displayName = getDisplayName(player)
          current.gameName = player.riotIdGameName
          current.tagLine = player.riotIdTagline
        }

        teammatesMap.set(player.puuid, current)
      }
    }

    const MIN_GAMES_TO_SHOW = 10

const teammates = [...teammatesMap.values()]
  .map(toFrequentTeammate)
  .filter(player => player.games >= MIN_GAMES_TO_SHOW)
  .sort((a, b) => {
    if (b.games !== a.games) return b.games - a.games
    return b.lastSeenAt - a.lastSeenAt
  })
  .slice(0, 12)

    const result: FrequentTeammatesResponse = {
      puuid,
      analyzedMatches: matches.length,
      teammates,
      lastUpdatedAt: new Date().toISOString(),
    }

    cacheSet(cacheKey, result, 5 * 60 * 1000)

    return c.json({ data: result, cached: false })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status || 500

    console.error('Error fetching frequent teammates:', {
      status,
      puuid,
      count,
    })

    return c.json(
      {
        error: 'Error fetching frequent teammates',
        status,
      },
      status as 400
    )
  }
})

export default app