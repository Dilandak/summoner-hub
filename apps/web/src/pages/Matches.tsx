import { useSummoner } from '@/hooks/useSummoner'
import { MatchList } from '@/components/matches/MatchList'

export function Matches() {
  const { data } = useSummoner()
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gold-text">Historial de Partidas</h1>
        <div className="gold-divider mt-3" />
      </div>
      {data && <MatchList puuid={data.summoner.puuid} />}
    </div>
  )
}
