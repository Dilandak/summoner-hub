import { ddragon } from '@/api/client'
import type { ChampionMastery } from '@summoner-hub/types'

interface Props { mastery: ChampionMastery; champName: string; rank: number }

export function ChampionCard({ mastery, champName, rank }: Props) {
  const level  = mastery.championLevel
  const points = (mastery.championPoints / 1000).toFixed(1)

  return (
    <div className="rift-card group overflow-hidden relative hover:scale-105 transition-transform duration-300 cursor-pointer">
      {/* Rank */}
      <div className="absolute top-2 left-2 z-20 font-display text-xs font-bold text-rift-gold/60">#{rank}</div>

      {/* Splash */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={ddragon.championLoading(champName)}
          alt={champName}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.src = ddragon.championSplash(champName)
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #111827 0%, transparent 60%)' }} />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-rift-gold2 text-lg">{champName}</h3>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-rift-gold/60 uppercase">Maestría</span>
          <span className="font-display font-bold text-rift-gold">Nv. {level}</span>
        </div>
        <div className="h-1 rounded-full bg-rift-border overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rift-gold/60 to-rift-gold rounded-full"
            style={{ width: `${Math.min(100, (mastery.championPoints / 100000) * 100)}%` }} />
        </div>
        <p className="font-mono text-xs text-rift-silver text-right">{points}K pts</p>
      </div>
    </div>
  )
}
