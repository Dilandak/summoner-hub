import { useSummoner } from '@/hooks/useSummoner'
import { useMatches } from '@/hooks/useMatches'
import { StatCard } from '@/components/ui/StatCard'
import { getKDA, getWinRate } from '@/utils/lol'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

export function Stats() {
  const { data: sumData } = useSummoner()
  const { data: matches }  = useMatches(sumData?.summoner.puuid, 20)

  const myPuuid = sumData?.summoner.puuid

  const stats = matches?.reduce((acc, match) => {
    const me = match.info.participants.find(p => p.puuid === myPuuid)
    if (!me) return acc
    return {
      kills:   acc.kills   + me.kills,
      deaths:  acc.deaths  + me.deaths,
      assists: acc.assists + me.assists,
      cs:      acc.cs      + me.totalMinionsKilled + me.neutralMinionsKilled,
      damage:  acc.damage  + me.totalDamageDealtToChampions,
      wins:    acc.wins    + (me.win ? 1 : 0),
      games:   acc.games   + 1,
    }
  }, { kills: 0, deaths: 0, assists: 0, cs: 0, damage: 0, wins: 0, games: 0 })

  const avgKDA  = stats ? getKDA(stats.kills / stats.games, stats.deaths / stats.games, stats.assists / stats.games) : '—'
  const avgCS   = stats ? Math.round(stats.cs / stats.games) : 0
  const avgDmg  = stats ? Math.round(stats.damage / stats.games / 1000) : 0
  const wr      = stats ? getWinRate(stats.wins, stats.games - stats.wins) : 0

  const champData = matches
    ? Object.entries(
        matches.reduce<Record<string, { wins: number; games: number }>>((acc, m) => {
          const me = m.info.participants.find(p => p.puuid === myPuuid)
          if (!me) return acc
          const c = me.championName
          if (!acc[c]) acc[c] = { wins: 0, games: 0 }
          acc[c].games++
          if (me.win) acc[c].wins++
          return acc
        }, {})
      )
      .map(([name, s]) => ({ name, wr: Math.round((s.wins / s.games) * 100), games: s.games }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 8)
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold gold-text">Estadísticas</h1>
        <p className="font-mono text-sm text-rift-silver mt-1">Últimas 20 partidas</p>
        <div className="gold-divider mt-3" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="KDA Promedio"  value={avgKDA} sub="Kills / Deaths / Assists" accent />
        <StatCard label="CS Promedio"   value={avgCS}  sub="Minions por partida" />
        <StatCard label="Daño Promedio" value={`${avgDmg}K`} sub="A campeones" />
        <StatCard label="Winrate"       value={`${wr}%`} sub={`${stats?.wins ?? 0}W / ${(stats?.games ?? 0) - (stats?.wins ?? 0)}L`} accent={wr >= 55} />
      </div>

      {champData.length > 0 && (
        <div className="rift-card p-6">
          <h2 className="font-display text-lg font-bold text-rift-gold2 mb-6">Winrate por Campeón</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={champData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#A0A0A0', fontSize: 11, fontFamily: 'Share Tech Mono' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#A0A0A0', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #C89B3C33', borderRadius: 8, fontFamily: 'Share Tech Mono' }}
                labelStyle={{ color: '#C89B3C' }}
                formatter={(v: number) => [`${v}%`, 'Winrate']}
              />
              <Bar dataKey="wr" radius={[4, 4, 0, 0]}>
                {champData.map((entry) => (
                  <Cell key={entry.name} fill={entry.wr >= 55 ? '#C89B3C' : entry.wr >= 50 ? '#0BC4E3' : '#ef444466'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
