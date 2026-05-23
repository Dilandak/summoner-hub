import { useState } from 'react'
import { useMatches } from '@/hooks/useMatches'
import { MatchCard } from './MatchCard'
import { MatchDetailModal } from './MatchDetailModal'
import { LoadingRift } from '@/components/ui/LoadingRift'
import type { MatchSummary } from '@summoner-hub/types'

interface Props {
  puuid: string
}

const INITIAL_COUNT = 10
const STEP = 10
const MAX_COUNT = 40

export function MatchList({ puuid }: Props) {
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null)
  const [count, setCount] = useState(INITIAL_COUNT)

  const {
    data: matches,
    isLoading,
    isFetching,
    error,
  } = useMatches(puuid, count)

  if (isLoading) {
    return <LoadingRift message="Cargando historial..." />
  }

  if (error) {
    return (
      <p className="text-red-400 font-mono text-sm text-center p-8">
        Error al cargar partidas
      </p>
    )
  }

  if (!matches?.length) {
    return (
      <p className="text-rift-silver font-mono text-sm text-center p-8">
        Sin partidas recientes
      </p>
    )
  }

  const canLoadMore = count < MAX_COUNT

  return (
    <>
      <div className="space-y-3">
        {matches.map(match => (
          <MatchCard
            key={match.metadata.matchId}
            match={match}
            puuid={puuid}
            onClick={() => setSelectedMatch(match)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-2 pt-6">
        {canLoadMore ? (
          <button
            type="button"
            onClick={() => setCount(prev => Math.min(prev + STEP, MAX_COUNT))}
            disabled={isFetching}
            className="font-mono text-xs uppercase tracking-[0.25em] border border-rift-gold/40 text-rift-gold rounded-full px-6 py-3 bg-rift-dark/70 hover:bg-rift-gold/10 hover:border-rift-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'Cargando partidas...' : 'Ver más partidas'}
          </button>
        ) : (
          <p className="font-mono text-xs text-rift-silver">
            Mostrando las últimas {MAX_COUNT} partidas analizadas
          </p>
        )}

        <p className="font-mono text-[11px] text-rift-gold/60">
          Mostrando {matches.length} partidas recientes
        </p>
      </div>

      {selectedMatch && (
        <MatchDetailModal
          open={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          match={selectedMatch}
          puuid={puuid}
        />
      )}
    </>
  )
}