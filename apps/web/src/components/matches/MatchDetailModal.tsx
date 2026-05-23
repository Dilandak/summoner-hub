import { ddragon } from '@/api/client'
import { formatDuration, getQueueName } from '@/utils/lol'
import type { MatchSummary } from '@summoner-hub/types'

interface Props {
  open: boolean
  onClose: () => void
  match: MatchSummary
  puuid: string
}

type Participant = MatchSummary['info']['participants'][number] & {
  riotIdGameName?: string
  riotIdTagline?: string
  summonerName?: string
  teamPosition?: string
  individualPosition?: string
  role?: string
  teamId: number
  goldEarned?: number
  visionScore?: number
  wardsPlaced?: number
  wardsKilled?: number
  totalDamageTaken?: number
  champLevel?: number
  totalHeal?: number
  item6?: number
  tripleKills?: number
  quadraKills?: number
  pentaKills?: number
  largestKillingSpree?: number
  firstBloodKill?: boolean
}

export function MatchDetailModal({ open, onClose, match, puuid }: Props) {
  if (!open) return null

  const participants = match.info.participants as Participant[]
  const me = participants.find(p => p.puuid === puuid)

  if (!me) return null

  const blueTeam = participants.filter(p => p.teamId === 100)
  const redTeam = participants.filter(p => p.teamId === 200)

  const blueKills = blueTeam.reduce((sum, p) => sum + p.kills, 0)
  const redKills = redTeam.reduce((sum, p) => sum + p.kills, 0)

  const mvp = getBestPlayer(participants, true)
  const ace = getBestPlayer(participants.filter(p => !p.win), false)
  const damageLeader = [...participants].sort(
    (a, b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions
  )[0]

  const myTeamKills = me.teamId === 100 ? blueKills : redKills
  const myKP = getKillParticipation(me, myTeamKills)

  const myBadges = getPlayerBadges({
    me,
    mvp,
    ace,
    damageLeader,
    myKP,
  })

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Cerrar detalle de partida"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-rift-gold/30 bg-rift-dark shadow-[0_0_90px_rgba(0,0,0,0.8)]">
        <div
          className="relative overflow-hidden rounded-t-2xl min-h-[320px]"
          style={{
            backgroundColor: '#010A13',
            backgroundImage: `
              linear-gradient(90deg, rgba(1,10,19,0.96) 0%, rgba(1,10,19,0.78) 45%, rgba(1,10,19,0.35) 100%),
              linear-gradient(180deg, transparent 0%, rgba(1,10,19,0.96) 100%),
              url(${ddragon.championSplash(me.championName)})
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

          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex items-start gap-5">
                <img
                  src={ddragon.championSquare(me.championName)}
                  alt={me.championName}
                  className="w-24 h-24 rounded-2xl border border-rift-gold/50 object-cover shadow-[0_0_35px_rgba(200,155,60,0.25)]"
                />

                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.35em] text-rift-blue">
                    Detalle de partida
                  </p>

                  <h2 className="font-display text-5xl font-bold gold-text mt-2">
                    {me.championName}
                  </h2>

                  <p className="font-mono text-sm text-rift-silver mt-2">
                    {me.win ? 'Victoria' : 'Derrota'} · {getQueueName(match.info.queueId)} · {formatDuration(match.info.gameDuration)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {myBadges.map(badge => (
                      <span
                        key={badge}
                        className="font-mono text-xs rounded-full px-3 py-1 border border-rift-gold/40 text-rift-gold bg-rift-gold/10"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[420px]">
                <HeroStat label="KDA" value={`${me.kills} / ${me.deaths} / ${me.assists}`} accent />
                <HeroStat label="KP" value={`${myKP}%`} sub="Kill participation" />
                <HeroStat label="Daño" value={me.totalDamageDealtToChampions.toLocaleString('es-CO')} />
                <HeroStat label="CS" value={getCS(me)} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatBox label="Oro" value={(me.goldEarned ?? 0).toLocaleString('es-CO')} />
            <StatBox label="Visión" value={me.visionScore ?? 0} />
            <StatBox label="Daño recibido" value={(me.totalDamageTaken ?? 0).toLocaleString('es-CO')} />
            <StatBox label="Nivel" value={me.champLevel ?? '—'} />
            <StatBox label="Racha mayor" value={me.largestKillingSpree ?? 0} />
            <StatBox label="Wards" value={me.wardsPlaced ?? 0} />
            <StatBox label="Wards kill" value={me.wardsKilled ?? 0} />
            <StatBox label="Score" value={getPlayerScore(me, myTeamKills)} accent />
          </div>

          <div className="rift-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-rift-blue">
                  Build final
                </p>
                <h3 className="font-display text-xl font-bold text-rift-gold2 mt-1">
                  Items usados por Dilandak
                </h3>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {getItems(me).map((itemId, index) =>
                  itemId > 0 ? (
                    <img
                      key={index}
                      src={ddragon.item(itemId)}
                      alt={`Item ${itemId}`}
                      className="w-10 h-10 rounded border border-rift-border object-cover"
                    />
                  ) : (
                    <div
                      key={index}
                      className="w-10 h-10 rounded border border-rift-border/40 bg-rift-dark/60"
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TeamPanel
              title="Equipo azul"
              team={blueTeam}
              teamKills={blueKills}
              puuid={puuid}
              mvpPuuid={mvp?.puuid}
              acePuuid={ace?.puuid}
            />

            <TeamPanel
              title="Equipo rojo"
              team={redTeam}
              teamKills={redKills}
              puuid={puuid}
              mvpPuuid={mvp?.puuid}
              acePuuid={ace?.puuid}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamPanel({
  title,
  team,
  teamKills,
  puuid,
  mvpPuuid,
  acePuuid,
}: {
  title: string
  team: Participant[]
  teamKills: number
  puuid: string
  mvpPuuid?: string
  acePuuid?: string
}) {
  const won = team.some(p => p.win)

  return (
    <div className="rift-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-rift-gold2">
          {title}
        </h3>

        <span className={`font-mono text-xs uppercase ${won ? 'text-rift-blue' : 'text-red-400'}`}>
          {won ? 'Victoria' : 'Derrota'} · {teamKills} kills
        </span>
      </div>

      <div className="space-y-2">
        {team.map(player => (
          <PlayerRow
            key={player.puuid}
            player={player}
            teamKills={teamKills}
            isMe={player.puuid === puuid}
            isMvp={player.puuid === mvpPuuid}
            isAce={player.puuid === acePuuid}
          />
        ))}
      </div>
    </div>
  )
}

function PlayerRow({
  player,
  teamKills,
  isMe,
  isMvp,
  isAce,
}: {
  player: Participant
  teamKills: number
  isMe: boolean
  isMvp: boolean
  isAce: boolean
}) {
  const name =
    player.riotIdGameName && player.riotIdTagline
      ? `${player.riotIdGameName}#${player.riotIdTagline}`
      : player.summonerName ?? 'Jugador'

  const kp = getKillParticipation(player, teamKills)

  return (
    <div
      className={`grid grid-cols-[36px_1fr_auto] gap-3 items-center rounded-lg border p-2 ${
        isMe
          ? 'border-rift-gold/50 bg-rift-gold/10'
          : 'border-rift-border/60 bg-rift-dark/35'
      }`}
    >
      <img
        src={ddragon.championSquare(player.championName)}
        alt={player.championName}
        className="w-9 h-9 rounded-lg border border-rift-border object-cover"
      />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm font-bold text-rift-gold2 truncate">
            {player.championName}
          </p>

          {isMe && <SmallBadge label="Tú" />}
          {isMvp && <SmallBadge label="MVP" />}
          {isAce && <SmallBadge label="ACE" />}
        </div>

        <p className="font-mono text-[11px] text-rift-silver truncate">
          {name}
        </p>
      </div>

      <div className="text-right">
        <p className="font-mono text-xs text-white">
          {player.kills}
          <span className="text-rift-silver"> / </span>
          <span className="text-red-400">{player.deaths}</span>
          <span className="text-rift-silver"> / </span>
          {player.assists}
        </p>

        <p className="font-mono text-[11px] text-rift-silver">
          {kp}% KP · {player.totalDamageDealtToChampions.toLocaleString('es-CO')} dmg
        </p>
      </div>
    </div>
  )
}

function HeroStat({
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
    <div className={`rift-card p-3 ${accent ? 'border-rift-gold/40' : ''}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-rift-gold/50">
        {label}
      </p>
      <p className={`font-display text-xl font-bold mt-1 ${accent ? 'gold-text' : 'text-rift-gold2'}`}>
        {value}
      </p>
      {sub && <p className="font-mono text-[10px] text-rift-silver">{sub}</p>}
    </div>
  )
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className={`rift-card p-3 text-center ${accent ? 'border-rift-gold/40' : ''}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-rift-gold/50">
        {label}
      </p>
      <p className={`font-display text-lg font-bold mt-1 ${accent ? 'gold-text' : 'text-rift-gold2'}`}>
        {value}
      </p>
    </div>
  )
}

function SmallBadge({ label }: { label: string }) {
  return (
    <span className="font-mono text-[9px] uppercase rounded-full border border-rift-gold/40 text-rift-gold px-1.5 py-0.5 bg-rift-gold/10">
      {label}
    </span>
  )
}

function getItems(player: Participant) {
  return [
    player.item0,
    player.item1,
    player.item2,
    player.item3,
    player.item4,
    player.item5,
    player.item6 ?? 0,
  ]
}

function getCS(player: Participant) {
  return (player.totalMinionsKilled ?? 0) + (player.neutralMinionsKilled ?? 0)
}

function getKillParticipation(player: Participant, teamKills: number) {
  if (!teamKills) return 0
  return Math.round(((player.kills + player.assists) / teamKills) * 100)
}

function getPlayerScore(player: Participant, teamKills: number) {
  const cs = getCS(player)
  const damage = player.totalDamageDealtToChampions ?? 0
  const gold = player.goldEarned ?? 0
  const vision = player.visionScore ?? 0
  const kp = getKillParticipation(player, teamKills)

  const kdaScore = player.kills * 2.4 + player.assists * 1.35 - player.deaths * 1.8
  const damageScore = damage * 0.0008
  const economyScore = cs * 0.08 + gold * 0.001
  const visionScore = vision * 0.3
  const kpScore = kp * 0.08
  const winBonus = player.win ? 8 : 0

  return Number((kdaScore + damageScore + economyScore + visionScore + kpScore + winBonus).toFixed(1))
}

function getBestPlayer(players: Participant[], onlyWinners: boolean) {
  const filtered = onlyWinners ? players.filter(p => p.win) : players

  return [...filtered].sort((a, b) => {
    const aTeamKills = players.filter(p => p.teamId === a.teamId).reduce((sum, p) => sum + p.kills, 0)
    const bTeamKills = players.filter(p => p.teamId === b.teamId).reduce((sum, p) => sum + p.kills, 0)

    return getPlayerScore(b, bTeamKills) - getPlayerScore(a, aTeamKills)
  })[0]
}

function getPlayerBadges({
  me,
  mvp,
  ace,
  damageLeader,
  myKP,
}: {
  me: Participant
  mvp?: Participant
  ace?: Participant
  damageLeader?: Participant
  myKP: number
}) {
  const badges: string[] = []

  if (mvp?.puuid === me.puuid) badges.push('MVP')
  if (!me.win && ace?.puuid === me.puuid) badges.push('ACE')
  if (damageLeader?.puuid === me.puuid) badges.push('Damage Leader')
  if (myKP >= 70) badges.push('Alta participación')
  if ((me.pentaKills ?? 0) > 0) badges.push('Penta Kill')
  else if ((me.quadraKills ?? 0) > 0) badges.push('Quadra Kill')
  else if ((me.tripleKills ?? 0) > 0) badges.push('Triple Kill')
  if (me.firstBloodKill) badges.push('First Blood')

  if (!badges.length) badges.push(me.win ? 'Victoria sólida' : 'Partida analizada')

  return badges
}