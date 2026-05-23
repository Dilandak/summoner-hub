import type { MatchSummary } from '@summoner-hub/types'

export type MatchParticipant = MatchSummary['info']['participants'][number] & {
  riotIdGameName?: string
  riotIdTagline?: string
  summonerName?: string
  teamId: number
  champLevel?: number
  goldEarned?: number
  visionScore?: number
  wardsPlaced?: number
  wardsKilled?: number
  totalDamageTaken?: number
  item6?: number
  tripleKills?: number
  quadraKills?: number
  pentaKills?: number
  largestKillingSpree?: number
  firstBloodKill?: boolean
}

export function getCS(player: MatchParticipant) {
  return (player.totalMinionsKilled ?? 0) + (player.neutralMinionsKilled ?? 0)
}

export function getItems(player: MatchParticipant) {
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

export function getTeamKills(players: MatchParticipant[], teamId: number) {
  return players
    .filter(player => player.teamId === teamId)
    .reduce((sum, player) => sum + player.kills, 0)
}

export function getKillParticipation(player: MatchParticipant, teamKills: number) {
  if (!teamKills) return 0
  return Math.round(((player.kills + player.assists) / teamKills) * 100)
}

export function getKdaRatio(player: MatchParticipant) {
  if (player.deaths === 0) return 'Perfect'
  return ((player.kills + player.assists) / player.deaths).toFixed(2)
}

export function getPlayerScore(player: MatchParticipant, teamKills: number) {
  const cs = getCS(player)
  const damage = player.totalDamageDealtToChampions ?? 0
  const gold = player.goldEarned ?? 0
  const vision = player.visionScore ?? 0
  const kp = getKillParticipation(player, teamKills)

  const kdaScore =
    player.kills * 2.4 +
    player.assists * 1.35 -
    player.deaths * 1.8

  const damageScore = damage * 0.0008
  const economyScore = cs * 0.08 + gold * 0.001
  const visionScore = vision * 0.3
  const kpScore = kp * 0.08
  const winBonus = player.win ? 8 : 0

  return Number(
    (kdaScore + damageScore + economyScore + visionScore + kpScore + winBonus).toFixed(1)
  )
}

export function getBestPlayer(players: MatchParticipant[], onlyWinners: boolean) {
  const filtered = onlyWinners ? players.filter(player => player.win) : players

  return [...filtered].sort((a, b) => {
    const aTeamKills = getTeamKills(players, a.teamId)
    const bTeamKills = getTeamKills(players, b.teamId)

    return getPlayerScore(b, bTeamKills) - getPlayerScore(a, aTeamKills)
  })[0]
}

export function getDamageLeader(players: MatchParticipant[]) {
  return [...players].sort(
    (a, b) =>
      (b.totalDamageDealtToChampions ?? 0) -
      (a.totalDamageDealtToChampions ?? 0)
  )[0]
}

export function getPlayerBadges({
  player,
  players,
  teamKills,
}: {
  player: MatchParticipant
  players: MatchParticipant[]
  teamKills: number
}) {
  const badges: string[] = []

  const mvp = getBestPlayer(players, true)
  const ace = getBestPlayer(players.filter(p => !p.win), false)
  const damageLeader = getDamageLeader(players)
  const kp = getKillParticipation(player, teamKills)

  if (mvp?.puuid === player.puuid) badges.push('MVP')
  if (!player.win && ace?.puuid === player.puuid) badges.push('ACE')
  if (damageLeader?.puuid === player.puuid) badges.push('Damage Leader')
  if (kp >= 70) badges.push('Alta participación')

  if ((player.pentaKills ?? 0) > 0) badges.push('Penta Kill')
  else if ((player.quadraKills ?? 0) > 0) badges.push('Quadra Kill')
  else if ((player.tripleKills ?? 0) > 0) badges.push('Triple Kill')

  if (player.firstBloodKill) badges.push('First Blood')

  if (!badges.length) {
    badges.push(player.win ? 'Victoria sólida' : 'Partida analizada')
  }

  return badges.slice(0, 3)
}

export function formatNumber(value: number | undefined) {
  return (value ?? 0).toLocaleString('es-CO')
}