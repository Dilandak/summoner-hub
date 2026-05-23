import type { ChampionMastery } from '@summoner-hub/types'
import type { ChampionMeta } from '@/hooks/useChampionIndex'
import type { ChampionStat } from '@/hooks/useChampionStats'

interface Props {
  mastery: ChampionMastery
  champion: ChampionMeta
  stat?: ChampionStat
  rank: number
  onClick?: () => void
}

export function ChampionCard({
  mastery,
  champion,
  stat,
  rank,
  onClick,
}: Props) {
  const level = mastery.championLevel
  const points = (mastery.championPoints / 1000).toFixed(1)

  return (
    <button
      type="button"
      onClick={onClick}
      className="rift-card group overflow-hidden relative hover:scale-105 transition-transform duration-300 cursor-pointer text-left"
    >
      <div className="absolute top-2 left-2 z-20 font-display text-xs font-bold text-rift-gold/60">
        #{rank}
      </div>

      <div className="relative h-40 overflow-hidden">
        <img
          src={champion.loadingUrl}
          alt={champion.name}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.src = champion.splashUrl
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #111827 0%, transparent 60%)',
          }}
        />

        {stat && (
          <div className="absolute bottom-2 right-2 rounded-full border border-rift-gold/30 bg-rift-dark/75 px-2 py-0.5">
            <span className="font-mono text-[10px] text-rift-gold">
              {stat.winRate}% WR
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-rift-gold2 text-lg truncate">
          {champion.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-rift-gold/60 uppercase">
            Maestría
          </span>
          <span className="font-display font-bold text-rift-gold">
            Nv. {level}
          </span>
        </div>

        <div className="h-1 rounded-full bg-rift-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rift-gold/60 to-rift-gold rounded-full"
            style={{
              width: `${Math.min(100, (mastery.championPoints / 100000) * 100)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-rift-silver">
            {points}K pts
          </p>

          {stat && (
            <p className="font-mono text-xs text-rift-blue">
              {stat.games} recientes
            </p>
          )}
        </div>

        {stat && (
          <p className="font-mono text-[11px] text-rift-silver truncate">
            {stat.kdaText} KDA prom.
          </p>
        )}
      </div>
    </button>
  )
}