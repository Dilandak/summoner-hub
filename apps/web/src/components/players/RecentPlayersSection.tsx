import { ddragon } from '@/api/client'
import { useRecentPlayers, type FrequentTeammate } from '@/hooks/useRecentPlayers'
import { timeAgo } from '@/utils/lol'
import { LoadingRift } from '@/components/ui/LoadingRift'

interface Props {
  puuid: string
  count?: number
}

export function RecentPlayersSection({ puuid, count = 40 }: Props) {
  const { data, isLoading, error } = useRecentPlayers(puuid, count)

  if (isLoading) {
    return <LoadingRift message="Analizando compañeros frecuentes..." />
  }

  if (error) {
    return (
      <div className="rift-card p-6 text-center">
        <h3 className="font-display text-xl font-bold text-red-400">
          No se pudieron cargar los compañeros frecuentes
        </h3>
        <p className="font-mono text-sm text-rift-silver mt-2">
          Intenta actualizar los datos en unos segundos.
        </p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-rift-gold2">
            Dúos y compañeros frecuentes
          </h2>
          <p className="font-mono text-sm text-rift-silver mt-1">
            Mis verdaderos amigos
          </p>
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-rift-gold/60">
          Ordenado por partidas juntos
        </span>
      </div>

      <div className="rift-card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-rift-gold2">
              Compañeros detectados
            </h3>
            <p className="font-mono text-xs text-rift-silver mt-1">
              Winrate calculado cuando jugaron en tu mismo equipo.
            </p>
          </div>

          <span className="font-mono text-xs text-rift-gold/60">
            Top {data.teammates.length}
          </span>
        </div>

        {data.teammates.length ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {data.teammates.map(player => (
              <FrequentTeammateCard
                key={player.puuid}
                player={player}
              />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-rift-silver text-center py-8">
            No se encontraron compañeros frecuentes en las partidas analizadas.
          </p>
        )}
      </div>
    </div>
  )
}

function FrequentTeammateCard({
  player,
}: {
  player: FrequentTeammate
}) {
  const isStrongDuo = player.games >= 3
  const isGoodWinrate = player.winRate >= 55

  return (
    <div className="relative overflow-hidden rounded-xl border border-rift-border/60 bg-rift-dark/35 p-4 hover:border-rift-gold/40 transition-colors">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${ddragon.championSplash(player.lastChampion)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 18%',
        }}
      />

      <div className="relative z-10 grid grid-cols-[52px_1fr_auto] gap-3 items-center">
        <img
          src={ddragon.championSquare(player.lastChampion)}
          alt={player.lastChampion}
          className="w-12 h-12 rounded-xl border border-rift-gold/25 object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-display text-base font-bold text-rift-gold2 truncate">
              {player.displayName}
            </p>

            {isStrongDuo && (
              <span className="font-mono text-[9px] uppercase rounded-full border border-rift-gold/35 text-rift-gold px-2 py-0.5 bg-rift-gold/10">
                Frecuente
              </span>
            )}

            {isGoodWinrate && (
              <span className="font-mono text-[9px] uppercase rounded-full border border-rift-blue/35 text-rift-blue px-2 py-0.5 bg-rift-blue/10">
                Buen WR
              </span>
            )}
          </div>

          <p className="font-mono text-[11px] text-rift-silver truncate mt-0.5">
            {player.games} partidas juntos · {player.mostCommonQueue}
          </p>

          <p className="font-mono text-[11px] text-rift-gold/60 truncate mt-0.5">
            Último: {player.lastChampion} · {timeAgo(player.lastSeenAt)}
          </p>

          <p className="font-mono text-[11px] text-rift-silver truncate mt-0.5">
            Champ más usado: {player.mostPlayedChampion} · KDA prom. {player.avgKdaText}
          </p>
        </div>

        <div className="text-right min-w-[92px]">
          <p className={`font-display text-2xl font-bold ${isGoodWinrate ? 'text-rift-gold' : 'text-rift-gold2'}`}>
            {player.winRate}%
          </p>

          <p className="font-mono text-[10px] text-rift-silver">
            WR juntos
          </p>

          <p className="font-mono text-[10px] mt-1">
            <span className="text-green-400">{player.wins}W</span>
            <span className="text-rift-silver"> / </span>
            <span className="text-red-400">{player.losses}L</span>
          </p>

          <p className="font-mono text-[10px] text-rift-silver mt-1">
            {player.avgDamage.toLocaleString('es-CO')} dmg prom.
          </p>
        </div>
      </div>
    </div>
  )
}