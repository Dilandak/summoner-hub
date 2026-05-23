import { ddragon } from '@/api/client'
import { formatDuration, getQueueName, timeAgo } from '@/utils/lol'
import type { MatchSummary } from '@summoner-hub/types'
import {
  formatNumber,
  getCS,
  getItems,
  getKdaRatio,
  getKillParticipation,
  getPlayerBadges,
  getPlayerScore,
  getTeamKills,
  type MatchParticipant,
} from '@/utils/matchAnalytics'

interface Props {
  match: MatchSummary
  puuid: string
  onClick?: () => void
}

export function MatchCard({ match, puuid, onClick }: Props) {
  const participants = match.info.participants as MatchParticipant[]
  const me = participants.find(p => p.puuid === puuid)

  if (!me) return null

  const teamKills = getTeamKills(participants, me.teamId)
  const kp = getKillParticipation(me, teamKills)
  const kda = getKdaRatio(me)
  const cs = getCS(me)
  const csMin = (cs / (match.info.gameDuration / 60)).toFixed(1)
  const queueName = getQueueName(match.info.queueId)
  const items = getItems(me)
  const badges = getPlayerBadges({
    player: me,
    players: participants,
    teamKills,
  })

  const score = getPlayerScore(me, teamKills)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rift-card w-full p-4 text-left hover:border-rift-gold/40 transition-all cursor-pointer group
        ${me.win ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-red-500'}`}
      style={{ borderLeft: `3px solid ${me.win ? '#0BC4E3' : '#ef4444'}` }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 text-center w-14">
          <p className={`font-display font-bold text-lg ${me.win ? 'text-rift-blue' : 'text-red-400'}`}>
            {me.win ? 'W' : 'L'}
          </p>
          <p className="font-mono text-[11px] text-rift-silver">
            {formatDuration(match.info.gameDuration)}
          </p>
        </div>

        <div className="flex-shrink-0 relative">
          <img
            src={ddragon.championSquare(me.championName)}
            alt={me.championName}
            className="w-14 h-14 rounded-xl object-cover border border-rift-gold/25 group-hover:border-rift-gold/60 transition"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />

          <span className="absolute -bottom-1 -right-1 bg-rift-navy border border-rift-border rounded text-[10px] font-mono px-1 text-rift-gold">
            {me.champLevel ?? ''}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-bold text-rift-gold2 truncate">
              {me.championName}
            </p>

            {badges.map(badge => (
              <span
                key={badge}
                className="font-mono text-[9px] uppercase rounded-full border border-rift-gold/35 text-rift-gold px-2 py-0.5 bg-rift-gold/10"
              >
                {badge}
              </span>
            ))}
          </div>

          <p className="font-mono text-sm mt-1">
            <span className="text-white">{me.kills}</span>
            <span className="text-rift-silver"> / </span>
            <span className="text-red-400">{me.deaths}</span>
            <span className="text-rift-silver"> / </span>
            <span className="text-white">{me.assists}</span>
            <span className="text-rift-gold/70 ml-2 text-xs">
              {kda === 'Perfect' ? '♾ KDA' : `${kda} KDA`}
            </span>
            <span className="text-rift-blue ml-2 text-xs">
              {kp}% KP
            </span>
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[11px] text-rift-silver">
            <span>{cs} CS · {csMin}/min</span>
            <span>{formatNumber(me.totalDamageDealtToChampions)} daño</span>
            <span>{me.visionScore ?? 0} visión</span>
            <span>Score {score}</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-1 flex-wrap max-w-[180px]">
          {items.map((itemId, i) =>
            itemId > 0 ? (
              <img
                key={i}
                src={ddragon.item(itemId)}
                alt={`Item ${itemId}`}
                className="w-7 h-7 rounded border border-rift-border object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div
                key={i}
                className="w-7 h-7 rounded border border-rift-border/30 bg-rift-dark/50"
              />
            )
          )}
        </div>

        <div className="hidden md:block text-right flex-shrink-0 min-w-[110px]">
          <p className="font-mono text-xs text-rift-gold/60 uppercase tracking-wider">
            {queueName}
          </p>
          <p className="font-mono text-xs text-rift-silver">
            {timeAgo(match.info.gameCreation)}
          </p>

          {(me.pentaKills ?? 0) > 0 && (
            <p className="text-yellow-300 text-xs font-bold mt-1">🏆 PENTA!</p>
          )}

          {(me.quadraKills ?? 0) > 0 && (me.pentaKills ?? 0) === 0 && (
            <p className="text-orange-300 text-xs font-bold mt-1">⚡ QUADRA</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-rift-border/50 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] text-rift-silver">
          Click para ver análisis completo de la partida
        </p>

        <span className="font-mono text-[11px] text-rift-gold group-hover:translate-x-1 transition-transform">
          Ver detalle →
        </span>
      </div>
    </button>
  )
}