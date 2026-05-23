import type { ChampionMastery } from '@summoner-hub/types'
import type { ChampionMeta } from '@/hooks/useChampionIndex'
import type { ChampionStat } from '@/hooks/useChampionStats'

interface Props {
  open: boolean
  onClose: () => void
  champion: ChampionMeta
  mastery: ChampionMastery
  stats?: ChampionStat
}

export function ChampionDetailModal({
  open,
  onClose,
  champion,
  mastery,
  stats,
}: Props) {
  if (!open) return null

  const points = mastery.championPoints.toLocaleString('es-CO')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-rift-gold/30 bg-rift-dark shadow-[0_0_80px_rgba(0,0,0,0.75)]">
        <div
          className="relative min-h-[300px] overflow-hidden rounded-t-2xl"
          style={{
            backgroundColor: '#010A13',
            backgroundImage: `
              linear-gradient(90deg, rgba(1,10,19,0.95) 0%, rgba(1,10,19,0.78) 45%, rgba(1,10,19,0.25) 100%),
              linear-gradient(180deg, transparent 0%, rgba(1,10,19,0.96) 100%),
              url(${champion.splashUrl})
            `,
            backgroundSize: 'cover, cover, cover',
            backgroundPosition: 'center, center, center 18%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full border border-rift-gold/30 text-rift-gold bg-rift-dark/70 hover:bg-rift-gold/10 transition"
          >
            ✕
          </button>

          <div className="relative z-10 p-8 flex flex-col md:flex-row gap-6 items-start">
            <img
              src={champion.squareUrl}
              alt={champion.name}
              className="w-24 h-24 rounded-2xl border border-rift-gold/50 object-cover shadow-[0_0_35px_rgba(200,155,60,0.25)]"
            />

            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-rift-blue">
                Champion profile
              </p>

              <h2 className="font-display text-5xl font-bold gold-text mt-2">
                {champion.name}
              </h2>

              <p className="font-mono text-sm text-rift-silver mt-1 capitalize">
                {champion.title}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge label={`Maestría Nv. ${mastery.championLevel}`} />
                <Badge label={`${points} pts`} />
                {stats && <Badge label={`${stats.games} partidas analizadas`} />}
                {stats && <Badge label={`${stats.winRate}% WR`} accent />}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBox label="Winrate" value={`${stats.winRate}%`} sub={`${stats.wins}W / ${stats.losses}L`} accent />
                <StatBox label="KDA promedio" value={stats.kdaText} sub="Kills / Deaths / Assists" />
                <StatBox label="CS promedio" value={stats.avgCs} sub="Por partida" />
                <StatBox label="Daño promedio" value={stats.avgDamage.toLocaleString('es-CO')} sub="A campeones" />
                <StatBox label="Oro promedio" value={stats.avgGold.toLocaleString('es-CO')} sub="Por partida" />
                <StatBox label="Visión promedio" value={stats.avgVision} sub="Vision score" />
                <StatBox label="Jugadas" value={stats.games} sub="Partidas recientes" />
                <StatBox label="Último uso" value={formatDate(stats.lastPlayedAt)} sub="Partida reciente" />
              </div>

              <div className="rift-card p-5">
                <h3 className="font-display text-xl font-bold text-rift-gold2 mb-4">
                  Rendimiento por modo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.queues.map(queue => (
                    <div
                      key={queue.queueId}
                      className="border border-rift-border/70 rounded-lg p-3 bg-rift-dark/40"
                    >
                      <div className="flex justify-between gap-3">
                        <p className="font-mono text-xs text-rift-gold uppercase">
                          {queue.queueName}
                        </p>
                        <p className="font-mono text-xs text-rift-silver">
                          {queue.games} partidas
                        </p>
                      </div>

                      <div className="mt-2 flex justify-between text-sm font-mono">
                        <span className="text-green-400">{queue.wins}W</span>
                        <span className="text-rift-gold">{queue.winRate}% WR</span>
                        <span className="text-red-400">{queue.losses}L</span>
                      </div>

                      <div className="h-1.5 rounded-full bg-red-500/25 overflow-hidden mt-2">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${queue.winRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {stats.bestGame && (
                <div className="rift-card p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.25em] text-rift-blue">
                        Mejor partida reciente
                      </p>

                      <h3 className="font-display text-2xl font-bold text-rift-gold2 mt-1">
                        {stats.bestGame.win ? 'Victoria' : 'Derrota'} · {stats.bestGame.queueName}
                      </h3>

                      <p className="font-mono text-sm text-rift-silver mt-1">
                        {formatDate(stats.bestGame.gameCreation)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <MiniStat label="KDA" value={stats.bestGame.kdaText} />
                      <MiniStat label="Daño" value={stats.bestGame.damage.toLocaleString('es-CO')} />
                      <MiniStat label="CS" value={stats.bestGame.cs} />
                      <MiniStat label="Score" value={stats.bestGame.score} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rift-card p-6 text-center">
              <h3 className="font-display text-xl font-bold text-rift-gold2">
                Sin partidas recientes con {champion.name}
              </h3>
              <p className="font-mono text-sm text-rift-silver mt-2">
No se encontraron estadísticas recientes con este campeón en las últimas partidas analizadas.              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      className={`font-mono text-xs rounded-full px-3 py-1 border ${
        accent
          ? 'border-rift-gold/50 text-rift-gold bg-rift-gold/10'
          : 'border-rift-blue/30 text-rift-blue bg-rift-blue/10'
      }`}
    >
      {label}
    </span>
  )
}

function StatBox({
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
      {sub && <p className="font-mono text-xs text-rift-silver mt-1">{sub}</p>}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-[90px] border border-rift-border/70 rounded-lg p-3 bg-rift-dark/50">
      <p className="font-mono text-[10px] uppercase text-rift-gold/50">
        {label}
      </p>
      <p className="font-display text-lg font-bold text-rift-gold2">
        {value}
      </p>
    </div>
  )
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}