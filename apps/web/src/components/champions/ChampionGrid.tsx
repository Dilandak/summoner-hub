import { useMemo, useState } from 'react'
import type { ChampionMastery } from '@summoner-hub/types'
import { useMastery } from '@/hooks/useMastery'
import { useChampionIndex, type ChampionMeta } from '@/hooks/useChampionIndex'
import { useChampionStats, type ChampionStat } from '@/hooks/useChampionStats'
import { ChampionCard } from './ChampionCard'
import { ChampionDetailModal } from './ChampionDetailModal'
import { LoadingRift } from '@/components/ui/LoadingRift'

interface Props {
  puuid: string
  count?: number
  statsCount?: number
}

type SelectedChampion = {
  mastery: ChampionMastery
  champion: ChampionMeta
  stat?: ChampionStat
}

export function ChampionGrid({ puuid, count = 6, statsCount = 50 }: Props) {
  const [selected, setSelected] = useState<SelectedChampion | null>(null)

  const { data: masteries, isLoading: masteryLoading } = useMastery(puuid, count)
  const { data: championIndex, isLoading: championsLoading } = useChampionIndex()
  const { data: championStats } = useChampionStats(puuid, statsCount)

  const statsByChampion = useMemo(() => {
    const map = new Map<string, ChampionStat>()

    championStats?.forEach(stat => {
      map.set(stat.championName.toLowerCase(), stat)
    })

    return map
  }, [championStats])

  if (masteryLoading || championsLoading) {
    return <LoadingRift message="Consultando campeones..." />
  }

  if (!masteries?.length || !championIndex) {
    return (
      <p className="text-rift-silver font-mono text-sm text-center p-8">
        Sin campeones disponibles
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {masteries.map((m, i) => {
          const champion = championIndex.byKey[m.championId]

          if (!champion) return null

          const stat = statsByChampion.get(champion.id.toLowerCase())

          return (
            <ChampionCard
              key={m.championId}
              mastery={m}
              champion={champion}
              stat={stat}
              rank={i + 1}
              onClick={() => setSelected({ mastery: m, champion, stat })}
            />
          )
        })}
      </div>

      {selected && (
        <ChampionDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          champion={selected.champion}
          mastery={selected.mastery}
          stats={selected.stat}
        />
      )}
    </>
  )
}