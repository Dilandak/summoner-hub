import type { RankedEntry, Tier } from '@summoner-hub/types'

export function getKDA(k: number, d: number, a: number): string {
  if (d === 0) return 'Perfect'
  return ((k + a) / d).toFixed(2)
}

export function getWinRate(wins: number, losses: number): number {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function timeAgo(timestampMs: number): string {
  const diff = Date.now() - timestampMs
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export function getSoloQ(ranked: RankedEntry[]) {
  return ranked.find(r => r.queueType === 'RANKED_SOLO_5x5')
}

export function getRankColor(tier: Tier): string {
  const colors: Record<Tier, string> = {
    IRON:        '#8B7355',
    BRONZE:      '#AD5E1E',
    SILVER:      '#A8B2C0',
    GOLD:        '#C89B3C',
    PLATINUM:    '#00B4D8',
    EMERALD:     '#2ECC71',
    DIAMOND:     '#9B59B6',
    MASTER:      '#FF6B9D',
    GRANDMASTER: '#FF4444',
    CHALLENGER:  '#00D4FF',
  }
  return colors[tier] || '#A0A0A0'
}

export function getQueueName(queueId: number): string {
  const queues: Record<number, string> = {
    420: 'Ranked Solo',
    440: 'Ranked Flex',
    450: 'ARAM',
    400: 'Normal Draft',
    430: 'Normal Blind',
    700: 'Clash',
    900: 'URF',
  }
  return queues[queueId] || 'Otro'
}

export function getCS(minions: number, neutral: number): number {
  return minions + neutral
}
