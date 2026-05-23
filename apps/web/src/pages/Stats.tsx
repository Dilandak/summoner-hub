import { useMemo } from 'react'
import { useSummoner } from '@/hooks/useSummoner'
import { useMatches } from '@/hooks/useMatches'
import { useChampionStats } from '@/hooks/useChampionStats'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingRift } from '@/components/ui/LoadingRift'
import { getKDA, getQueueName } from '@/utils/lol'
import {
  getCS,
  getKillParticipation,
  getTeamKills,
  type MatchParticipant,
} from '@/utils/matchAnalytics'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

const MATCH_COUNT = 30
const CHAMPION_STATS_COUNT = 50

export function Stats() {
  const { data: sumData, isLoading: summonerLoading } = useSummoner()
  const puuid = sumData?.account.puuid

  const {
    data: matches,
    isLoading: matchesLoading,
    error: matchesError,
  } = useMatches(puuid, MATCH_COUNT)

  const {
    data: championStats,
    isLoading: championStatsLoading,
  } = useChampionStats(puuid, CHAMPION_STATS_COUNT)

  const stats = useMemo(() => {
    if (!matches?.length || !puuid) return null

    let kills = 0
    let deaths = 0
    let assists = 0
    let cs = 0
    let damage = 0
    let vision = 0
    let gold = 0
    let wins = 0
    let games = 0
    let totalKP = 0

    const queueMap = new Map<
      number,
      {
        queueId: number
        queueName: string
        games: number
        wins: number
        damage: number
        kdaKills: number
        kdaDeaths: number
        kdaAssists: number
      }
    >()

    const timeline = matches
      .map((match, index) => {
        const participants = match.info.participants as MatchParticipant[]
        const me = participants.find(p => p.puuid === puuid)
        if (!me) return null

        const teamKills = getTeamKills(participants, me.teamId)
        const kp = getKillParticipation(me, teamKills)
        const matchCs = getCS(me)
        const matchDamage = me.totalDamageDealtToChampions ?? 0
        const matchVision = me.visionScore ?? 0
        const matchGold = me.goldEarned ?? 0

        games += 1
        kills += me.kills
        deaths += me.deaths
        assists += me.assists
        cs += matchCs
        damage += matchDamage
        vision += matchVision
        gold += matchGold
        totalKP += kp

        if (me.win) wins += 1

        const queueId = match.info.queueId
        const queueCurrent = queueMap.get(queueId) ?? {
          queueId,
          queueName: getQueueName(queueId),
          games: 0,
          wins: 0,
          damage: 0,
          kdaKills: 0,
          kdaDeaths: 0,
          kdaAssists: 0,
        }

        queueCurrent.games += 1
        queueCurrent.wins += me.win ? 1 : 0
        queueCurrent.damage += matchDamage
        queueCurrent.kdaKills += me.kills
        queueCurrent.kdaDeaths += me.deaths
        queueCurrent.kdaAssists += me.assists

        queueMap.set(queueId, queueCurrent)

        return {
          name: `#${matches.length - index}`,
          result: me.win ? 1 : 0,
          resultLabel: me.win ? 'W' : 'L',
          champion: me.championName,
          queue: getQueueName(match.info.queueId),
          kills: me.kills,
          deaths: me.deaths,
          assists: me.assists,
          kda: me.deaths === 0 ? me.kills + me.assists : Number(((me.kills + me.assists) / me.deaths).toFixed(2)),
          damage: matchDamage,
          cs: matchCs,
          vision: matchVision,
          kp,
        }
      })
      .filter(Boolean)
      .reverse() as Array<{
        name: string
        result: number
        resultLabel: string
        champion: string
        queue: string
        kills: number
        deaths: number
        assists: number
        kda: number
        damage: number
        cs: number
        vision: number
        kp: number
      }>

    const losses = games - wins

    const queueStats = [...queueMap.values()]
      .map(queue => ({
        ...queue,
        losses: queue.games - queue.wins,
        winRate: queue.games ? Math.round((queue.wins / queue.games) * 100) : 0,
        avgDamage: queue.games ? Math.round(queue.damage / queue.games) : 0,
        kdaText: getKDA(
          queue.kdaKills / queue.games,
          queue.kdaDeaths / queue.games,
          queue.kdaAssists / queue.games
        ),
      }))
      .sort((a, b) => b.games - a.games)

    return {
      games,
      wins,
      losses,
      winRate: games ? Math.round((wins / games) * 100) : 0,
      avgKda: getKDA(kills / games, deaths / games, assists / games),
      avgKills: Number((kills / games).toFixed(1)),
      avgDeaths: Number((deaths / games).toFixed(1)),
      avgAssists: Number((assists / games).toFixed(1)),
      avgCs: Math.round(cs / games),
      avgDamage: Math.round(damage / games),
      avgVision: Number((vision / games).toFixed(1)),
      avgGold: Math.round(gold / games),
      avgKP: Math.round(totalKP / games),
      timeline,
      queueStats,
    }
  }, [matches, puuid])

  const championPool = useMemo(() => {
    if (!championStats?.length) return []

    return championStats
      .filter(champ => champ.games > 0)
      .slice(0, 8)
  }, [championStats])

  const bestChampions = useMemo(() => {
    if (!championStats?.length) return []

    return championStats
      .filter(champ => champ.games >= 2)
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate
        return b.games - a.games
      })
      .slice(0, 5)
  }, [championStats])

  const isLoading = summonerLoading || matchesLoading || championStatsLoading

  if (isLoading) {
    return <LoadingRift message="Calculando estadísticas avanzadas..." />
  }

  if (matchesError || !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rift-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-red-400">
            No se pudieron cargar las estadísticas
          </h1>
          <p className="font-mono text-sm text-rift-silver mt-2">
            Intenta actualizar los datos o espera unos segundos si Riot API está limitando peticiones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-rift-blue">
              Performance Overview
            </p>

            <h1 className="font-display text-4xl font-bold gold-text mt-2">
              Stats 2.0
            </h1>

            <p className="font-mono text-sm text-rift-silver mt-2">
              Resumen competitivo de Dilandak basado en las últimas {stats.games} partidas analizadas.
            </p>
          </div>

          <div className="rift-card px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-rift-gold/50">
              Riot ID
            </p>
            <p className="font-display text-lg font-bold text-rift-gold2">
              {sumData?.account.gameName}#{sumData?.account.tagLine}
            </p>
          </div>
        </div>

        <div className="gold-divider mt-5" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard
          label="Winrate"
          value={`${stats.winRate}%`}
          sub={`${stats.wins}W / ${stats.losses}L`}
          accent={stats.winRate >= 55}
        />

        <StatCard
          label="KDA Prom."
          value={stats.avgKda}
          sub={`${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists}`}
          accent
        />

        <StatCard
          label="Daño Prom."
          value={stats.avgDamage.toLocaleString('es-CO')}
          sub="A campeones"
        />

        <StatCard
          label="CS Prom."
          value={stats.avgCs}
          sub="Por partida"
        />

        <StatCard
          label="Visión"
          value={stats.avgVision}
          sub="Vision score"
        />

        <StatCard
          label="KP Prom."
          value={`${stats.avgKP}%`}
          sub="Participación"
        />

        <StatCard
          label="Oro Prom."
          value={stats.avgGold.toLocaleString('es-CO')}
          sub="Por partida"
        />

        <StatCard
          label="Partidas"
          value={stats.games}
          sub="Analizadas"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rift-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-rift-gold2">
              Línea de resultados
            </h2>
            <p className="font-mono text-xs text-rift-silver mt-1">
              W/L de tus últimas partidas analizadas.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.timeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'Share Tech Mono' }}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(v) => (v === 1 ? 'W' : 'L')}
                tick={{ fill: '#A0A0A0', fontSize: 11 }}
              />
              <Tooltip content={<ResultTooltip />} />
              <Bar dataKey="result" radius={[4, 4, 0, 0]}>
                {stats.timeline.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={entry.result === 1 ? '#0BC4E3' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rift-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-rift-gold2">
              Daño por partida
            </h2>
            <p className="font-mono text-xs text-rift-silver mt-1">
              Daño a campeones en orden cronológico.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.timeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid stroke="#C89B3C22" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'Share Tech Mono' }}
              />
              <YAxis
                tick={{ fill: '#A0A0A0', fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`}
              />
              <Tooltip content={<DamageTooltip />} />
              <Line
                type="monotone"
                dataKey="damage"
                stroke="#C89B3C"
                strokeWidth={2}
                dot={{ r: 3, fill: '#C89B3C' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rift-card p-6">
          <div className="mb-5">
            <h2 className="font-display text-xl font-bold text-rift-gold2">
              Champion pool reciente
            </h2>
            <p className="font-mono text-xs text-rift-silver mt-1">
              Campeones más usados dentro de las partidas analizadas.
            </p>
          </div>

          {championPool.length ? (
            <div className="space-y-3">
              {championPool.map(champ => (
                <ChampionPoolRow key={champ.championName} champ={champ} />
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-rift-silver text-center py-8">
              No hay suficientes datos recientes de campeones.
            </p>
          )}
        </div>

        <div className="rift-card p-6">
          <div className="mb-5">
            <h2 className="font-display text-xl font-bold text-rift-gold2">
              Mejores picks
            </h2>
            <p className="font-mono text-xs text-rift-silver mt-1">
              Campeones con mejor winrate reciente.
            </p>
          </div>

          {bestChampions.length ? (
            <div className="space-y-3">
              {bestChampions.map((champ, index) => (
                <div
                  key={champ.championName}
                  className="flex items-center justify-between gap-3 rounded-xl border border-rift-border/60 bg-rift-dark/35 p-3"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-rift-gold2">
                      #{index + 1} {champ.championName}
                    </p>
                    <p className="font-mono text-[11px] text-rift-silver">
                      {champ.games} partidas · {champ.kdaText} KDA
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-display text-xl font-bold ${champ.winRate >= 55 ? 'text-rift-gold' : 'text-rift-gold2'}`}>
                      {champ.winRate}%
                    </p>
                    <p className="font-mono text-[10px] text-rift-silver">
                      {champ.wins}W / {champ.losses}L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-rift-silver text-center py-8">
              Juega más partidas para detectar mejores picks.
            </p>
          )}
        </div>
      </div>

      <div className="rift-card p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-rift-gold2">
            Rendimiento por modo
          </h2>
          <p className="font-mono text-xs text-rift-silver mt-1">
            Comparativa de desempeño por cola de juego.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.queueStats.map(queue => (
            <div
              key={queue.queueId}
              className="rounded-xl border border-rift-border/60 bg-rift-dark/35 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-rift-gold2">
                    {queue.queueName}
                  </h3>
                  <p className="font-mono text-xs text-rift-silver mt-1">
                    {queue.games} partidas
                  </p>
                </div>

                <p className={`font-display text-2xl font-bold ${queue.winRate >= 55 ? 'text-rift-gold' : 'text-rift-gold2'}`}>
                  {queue.winRate}%
                </p>
              </div>

              <div className="mt-4 h-1.5 rounded-full bg-red-500/25 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${queue.winRate}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniStat label="W" value={queue.wins} />
                <MiniStat label="L" value={queue.losses} />
                <MiniStat label="KDA" value={queue.kdaText} />
              </div>

              <p className="font-mono text-[11px] text-rift-silver mt-3">
                Daño prom. {queue.avgDamage.toLocaleString('es-CO')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChampionPoolRow({
  champ,
}: {
  champ: {
    championName: string
    games: number
    wins: number
    losses: number
    winRate: number
    kdaText: string
    avgDamage: number
    avgCs: number
    avgVision: number
  }
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-rift-border/60 bg-rift-dark/35 p-4 hover:border-rift-gold/35 transition-colors">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-bold text-rift-gold2">
            {champ.championName}
          </h3>

          <span className="font-mono text-[10px] uppercase rounded-full border border-rift-gold/35 text-rift-gold px-2 py-0.5 bg-rift-gold/10">
            {champ.games} partidas
          </span>
        </div>

        <p className="font-mono text-xs text-rift-silver mt-1">
          {champ.kdaText} KDA · {champ.avgCs} CS prom. · {champ.avgVision} visión
        </p>

        <div className="h-1.5 rounded-full bg-red-500/25 overflow-hidden mt-3 max-w-md">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${champ.winRate}%` }}
          />
        </div>
      </div>

      <div className="text-right min-w-[90px]">
        <p className={`font-display text-2xl font-bold ${champ.winRate >= 55 ? 'text-rift-gold' : 'text-rift-gold2'}`}>
          {champ.winRate}%
        </p>

        <p className="font-mono text-[10px] text-rift-silver">
          {champ.wins}W / {champ.losses}L
        </p>

        <p className="font-mono text-[10px] text-rift-silver mt-1">
          {champ.avgDamage.toLocaleString('es-CO')} dmg
        </p>
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-lg border border-rift-border/50 bg-rift-dark/40 p-2">
      <p className="font-mono text-[10px] uppercase text-rift-gold/50">
        {label}
      </p>
      <p className="font-display text-sm font-bold text-rift-gold2">
        {value}
      </p>
    </div>
  )
}

function ResultTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-rift-gold/30 bg-rift-dark p-3 shadow-xl">
      <p className="font-display text-sm font-bold text-rift-gold2">
        {data.resultLabel} · {data.champion}
      </p>
      <p className="font-mono text-xs text-rift-silver mt-1">
        {data.queue}
      </p>
      <p className="font-mono text-xs text-rift-silver mt-1">
        {data.kills} / {data.deaths} / {data.assists} · {data.kp}% KP
      </p>
    </div>
  )
}

function DamageTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-rift-gold/30 bg-rift-dark p-3 shadow-xl">
      <p className="font-display text-sm font-bold text-rift-gold2">
        {data.champion}
      </p>
      <p className="font-mono text-xs text-rift-silver mt-1">
        Daño: {data.damage.toLocaleString('es-CO')}
      </p>
      <p className="font-mono text-xs text-rift-silver mt-1">
        KDA: {data.kills} / {data.deaths} / {data.assists}
      </p>
    </div>
  )
}