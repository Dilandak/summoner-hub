import { useMemo, useState } from 'react'
import type { ChampionMastery } from '@summoner-hub/types'
import { useSummoner } from '@/hooks/useSummoner'
import { useMastery } from '@/hooks/useMastery'
import { useChampionIndex, type ChampionMeta } from '@/hooks/useChampionIndex'
import { useChampionStats, type ChampionStat } from '@/hooks/useChampionStats'
import { ChampionCard } from '@/components/champions/ChampionCard'
import { ChampionDetailModal } from '@/components/champions/ChampionDetailModal'
import { LoadingRift } from '@/components/ui/LoadingRift'

type SortMode = 'mastery' | 'recent' | 'winrate' | 'name'
type QueueFilter = 'all' | 'ranked' | 'normal' | 'aram'

type ChampionEntry = {
  mastery: ChampionMastery
  champion: ChampionMeta
  stat?: ChampionStat
  masteryRank: number
}

type SelectedChampion = {
  mastery: ChampionMastery
  champion: ChampionMeta
  stat?: ChampionStat
}

const MASTERY_COUNT = 40
const CHAMPION_STATS_COUNT = 30

export function Champions() {
  const [sortMode, setSortMode] = useState<SortMode>('mastery')
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')
  const [selected, setSelected] = useState<SelectedChampion | null>(null)

  const { data: summonerData, isLoading: summonerLoading } = useSummoner()
  const puuid = summonerData?.account.puuid

  const { data: masteries, isLoading: masteryLoading } = useMastery(puuid, MASTERY_COUNT)
  const { data: championIndex, isLoading: championIndexLoading } = useChampionIndex()
  const { data: championStats, isFetching: championStatsFetching } = useChampionStats(
  puuid,
  CHAMPION_STATS_COUNT
)

  const statsByChampion = useMemo(() => {
    const map = new Map<string, ChampionStat>()

    championStats?.forEach(stat => {
      map.set(stat.championName.toLowerCase(), stat)
    })

    return map
  }, [championStats])

  const championEntries = useMemo<ChampionEntry[]>(() => {
    if (!masteries?.length || !championIndex) return []

    const entries = masteries
      .map((mastery, index) => {
        const champion = championIndex.byKey[mastery.championId]

        if (!champion) return null

        const stat = statsByChampion.get(champion.id.toLowerCase())

        return {
          mastery,
          champion,
          stat,
          masteryRank: index + 1,
        }
      })
      .filter(Boolean) as ChampionEntry[]

    return entries
      .filter(entry => passesQueueFilter(entry.stat, queueFilter))
      .sort((a, b) => {
        if (sortMode === 'mastery') {
          return b.mastery.championPoints - a.mastery.championPoints
        }

        if (sortMode === 'recent') {
          return (b.stat?.games ?? 0) - (a.stat?.games ?? 0)
        }

        if (sortMode === 'winrate') {
          const aGames = a.stat?.games ?? 0
          const bGames = b.stat?.games ?? 0

          if (bGames !== aGames && (aGames < 2 || bGames < 2)) {
            return bGames - aGames
          }

          return (b.stat?.winRate ?? 0) - (a.stat?.winRate ?? 0)
        }

        return a.champion.name.localeCompare(b.champion.name)
      })
  }, [masteries, championIndex, statsByChampion, sortMode, queueFilter])

 const isLoading =
  summonerLoading ||
  masteryLoading ||
  championIndexLoading

  if (isLoading) {
    return <LoadingRift message="Preparando champion pool..." />
  }

  if (!summonerData || !puuid) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rift-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-red-400">
            No se pudo cargar el invocador
          </h1>
          <p className="font-mono text-sm text-rift-silver mt-2">
            Revisa la conexión con Riot API.
          </p>
        </div>
      </div>
    )
  }

  const totalMasteryPoints =
    masteries?.reduce((sum, mastery) => sum + mastery.championPoints, 0) ?? 0

  const mostPlayedRecent = championStats?.[0]
  const bestRecentPick = championStats
    ?.filter(champ => champ.games >= 2)
    .sort((a, b) => b.winRate - a.winRate)[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-rift-blue">
              Champion Pool
            </p>

            <h1 className="font-display text-4xl font-bold gold-text mt-2">
              Mis Campeones
            </h1>

            <p className="font-mono text-sm text-rift-silver mt-2">
              Maestría, rendimiento reciente y picks más fuertes de {summonerData.account.gameName}#{summonerData.account.tagLine}.
            </p>
          </div>

          <div className="rift-card px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-rift-gold/50">
              Campeones cargados
            </p>
            <p className="font-display text-lg font-bold text-rift-gold2">
              {championEntries.length}
            </p>
          </div>
        </div>

        <div className="gold-divider mt-5" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <HeaderStat
          label="Puntos totales"
          value={`${Math.round(totalMasteryPoints / 1000).toLocaleString('es-CO')}K`}
          sub="Maestría acumulada"
          accent
        />

        <HeaderStat
          label="Main reciente"
          value={mostPlayedRecent?.championName ?? '—'}
          sub={mostPlayedRecent ? `${mostPlayedRecent.games} partidas recientes` : 'Sin datos'}
        />

        <HeaderStat
          label="Mejor pick"
          value={bestRecentPick?.championName ?? '—'}
          sub={bestRecentPick ? `${bestRecentPick.winRate}% WR` : 'Mín. 2 partidas'}
        />

        <HeaderStat
          label="Analizadas"
          value={championStats?.length ?? 0}
          sub="Con partidas recientes"
        />
      </div>

      <div className="rift-card p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-rift-gold2">
              Explorar campeones
            </h2>
            <p className="font-mono text-xs text-rift-silver mt-1">
              Ordena tu champion pool por maestría, uso reciente o rendimiento.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <FilterGroup>
              <FilterButton active={sortMode === 'mastery'} onClick={() => setSortMode('mastery')}>
                Más maestría
              </FilterButton>
              <FilterButton active={sortMode === 'recent'} onClick={() => setSortMode('recent')}>
                Más jugados
              </FilterButton>
              <FilterButton active={sortMode === 'winrate'} onClick={() => setSortMode('winrate')}>
                Mejor WR
              </FilterButton>
              <FilterButton active={sortMode === 'name'} onClick={() => setSortMode('name')}>
                A-Z
              </FilterButton>
            </FilterGroup>

            <FilterGroup>
              <FilterButton active={queueFilter === 'all'} onClick={() => setQueueFilter('all')}>
                Todo
              </FilterButton>
              <FilterButton active={queueFilter === 'ranked'} onClick={() => setQueueFilter('ranked')}>
                Ranked
              </FilterButton>
              <FilterButton active={queueFilter === 'normal'} onClick={() => setQueueFilter('normal')}>
                Normal
              </FilterButton>
              <FilterButton active={queueFilter === 'aram'} onClick={() => setQueueFilter('aram')}>
                ARAM
              </FilterButton>
            </FilterGroup>
          </div>
        </div>
      </div>

      {championEntries.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {championEntries.map((entry, index) => (
            <ChampionCard
              key={entry.mastery.championId}
              mastery={entry.mastery}
              champion={entry.champion}
              stat={entry.stat}
              rank={sortMode === 'mastery' ? entry.masteryRank : index + 1}
              onClick={() =>
                setSelected({
                  mastery: entry.mastery,
                  champion: entry.champion,
                  stat: entry.stat,
                })
              }
            />
          ))}
        </div>
      ) : (
        <div className="rift-card p-8 text-center">
          <h3 className="font-display text-xl font-bold text-rift-gold2">
            Sin campeones para este filtro
          </h3>
          <p className="font-mono text-sm text-rift-silver mt-2">
            Prueba cambiando el modo o el orden de visualización.
          </p>
        </div>
      )}

      {selected && (
        <ChampionDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          champion={selected.champion}
          mastery={selected.mastery}
          stats={selected.stat}
        />
      )}
    </div>
  )
}

function passesQueueFilter(stat: ChampionStat | undefined, filter: QueueFilter) {
  if (filter === 'all') return true
  if (!stat) return false

  const queueIds = stat.queues.map(queue => queue.queueId)

  if (filter === 'ranked') {
    return queueIds.some(queueId => queueId === 420 || queueId === 440)
  }

  if (filter === 'normal') {
    return queueIds.some(queueId => queueId === 400 || queueId === 430)
  }

  if (filter === 'aram') {
    return queueIds.some(queueId => queueId === 450)
  }

  return true
}

function HeaderStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rift-card p-4 ${accent ? 'border-rift-gold/40' : ''}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-rift-gold/50">
        {label}
      </p>
      <p className={`font-display text-2xl font-bold mt-1 ${accent ? 'gold-text' : 'text-rift-gold2'}`}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-xs text-rift-silver mt-1">
          {sub}
        </p>
      )}
    </div>
  )
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-full border border-rift-border/70 bg-rift-dark/45 p-1">
      {children}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[10px] uppercase tracking-[0.18em] rounded-full px-3 py-2 transition-all ${
        active
          ? 'bg-rift-gold/15 text-rift-gold border border-rift-gold/35'
          : 'text-rift-silver hover:text-rift-gold hover:bg-rift-gold/5 border border-transparent'
      }`}
    >
      {children}
    </button>
  )
}