import { ddragon } from '@/api/client'
import { getKDA, formatDuration, getCS, timeAgo, getQueueName } from '@/utils/lol'
import type { MatchSummary } from '@summoner-hub/types'

interface Props { match: MatchSummary; puuid: string }

export function MatchCard({ match, puuid }: Props) {
  const me = match.info.participants.find(p => p.puuid === puuid)
  if (!me) return null

  const kda      = getKDA(me.kills, me.deaths, me.assists)
  const cs       = getCS(me.totalMinionsKilled, me.neutralMinionsKilled)
  const csMin    = (cs / (match.info.gameDuration / 60)).toFixed(1)
  const items    = [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5]
  const queueName = getQueueName(match.info.queueId)

  return (
    <div className={`rift-card p-4 flex items-center gap-4 hover:border-rift-gold/30 transition-colors cursor-pointer group
      ${me.win ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-red-500'}`}
      style={{ borderLeft: `3px solid ${me.win ? '#0BC4E3' : '#ef4444'}` }}>

      {/* Result */}
      <div className="flex-shrink-0 text-center w-12">
        <p className={`font-display font-bold text-lg ${me.win ? 'text-rift-blue' : 'text-red-400'}`}>
          {me.win ? 'W' : 'L'}
        </p>
        <p className="font-mono text-xs text-rift-silver">{formatDuration(match.info.gameDuration)}</p>
      </div>

      {/* Champion */}
      <div className="flex-shrink-0 relative">
        <img src={ddragon.championSquare(me.championName)}
          alt={me.championName}
          className="w-12 h-12 rounded-lg object-cover border border-rift-gold/20"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <span className="absolute -bottom-1 -right-1 bg-rift-navy border border-rift-border rounded text-xs font-mono px-1 text-rift-gold">
          {me.champLevel ?? ''}
        </span>
      </div>

      {/* KDA */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-bold text-rift-gold2 truncate">{me.championName}</p>
        <p className="font-mono text-sm">
          <span className="text-white">{me.kills}</span>
          <span className="text-rift-silver"> / </span>
          <span className="text-red-400">{me.deaths}</span>
          <span className="text-rift-silver"> / </span>
          <span className="text-white">{me.assists}</span>
          <span className="text-rift-gold/60 ml-2 text-xs">{kda === 'Perfect' ? '♾ KDA' : `${kda} KDA`}</span>
        </p>
        <p className="font-mono text-xs text-rift-silver">{cs} CS · {csMin}/min</p>
      </div>

      {/* Items */}
      <div className="hidden sm:flex gap-1 flex-wrap max-w-[140px]">
        {items.map((itemId, i) => itemId > 0 ? (
          <img key={i} src={ddragon.item(itemId)} alt={`Item ${itemId}`}
            className="w-7 h-7 rounded border border-rift-border object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div key={i} className="w-7 h-7 rounded border border-rift-border/30 bg-rift-dark/50" />
        ))}
      </div>

      {/* Meta */}
      <div className="hidden md:block text-right flex-shrink-0 min-w-[90px]">
        <p className="font-mono text-xs text-rift-gold/60 uppercase tracking-wider">{queueName}</p>
        <p className="font-mono text-xs text-rift-silver">{timeAgo(match.info.gameCreation)}</p>
        {me.pentaKills > 0 && <p className="text-yellow-300 text-xs font-bold mt-1">🏆 PENTA!</p>}
        {me.quadraKills > 0 && me.pentaKills === 0 && <p className="text-orange-300 text-xs font-bold mt-1">⚡ QUADRA</p>}
      </div>
    </div>
  )
}
