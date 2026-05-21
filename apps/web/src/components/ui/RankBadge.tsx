import type { Tier } from '@summoner-hub/types'
import { getRankColor } from '@/utils/lol'

interface Props {
  tier: Tier
  division?: string
  lp?: number
  size?: 'sm' | 'md' | 'lg'
}

export function RankBadge({ tier, division, lp, size = 'md' }: Props) {
  const color = getRankColor(tier)
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-2' }
  return (
    <span className={`font-display font-bold tracking-widest uppercase rounded ${sizes[size]}`}
      style={{ color, border: `1px solid ${color}44`, background: `${color}11` }}>
      {tier} {division} {lp !== undefined && <span className="font-mono font-normal">{lp} LP</span>}
    </span>
  )
}
