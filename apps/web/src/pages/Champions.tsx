import { useSummoner } from '@/hooks/useSummoner'
import { ChampionGrid } from '@/components/champions/ChampionGrid'

export function Champions() {
  const { data } = useSummoner()
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gold-text">Mis Mains</h1>
        <p className="font-mono text-sm text-rift-silver mt-1">Campeones con mayor maestría</p>
        <div className="gold-divider mt-3" />
      </div>
      {data && <ChampionGrid puuid={data.summoner.puuid} />}
    </div>
  )
}
