import { useMatches } from '@/hooks/useMatches'
import { MatchCard } from './MatchCard'
import { LoadingRift } from '@/components/ui/LoadingRift'

interface Props { puuid: string }

export function MatchList({ puuid }: Props) {
  const { data: matches, isLoading, error } = useMatches(puuid, 10)

  if (isLoading) return <LoadingRift message="Cargando historial..." />
  if (error)     return <p className="text-red-400 font-mono text-sm text-center p-8">Error al cargar partidas</p>
  if (!matches?.length) return <p className="text-rift-silver font-mono text-sm text-center p-8">Sin partidas recientes</p>

  return (
    <div className="space-y-2">
      {matches.map(match => (
        <MatchCard key={match.metadata.matchId} match={match} puuid={puuid} />
      ))}
    </div>
  )
}
