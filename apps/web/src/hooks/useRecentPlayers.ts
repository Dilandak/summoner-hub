import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

export interface FrequentTeammate {
  puuid: string
  displayName: string
  gameName?: string
  tagLine?: string
  games: number
  wins: number
  losses: number
  winRate: number
  lastSeenAt: number
  lastChampion: string
  mostPlayedChampion: string
  mostCommonQueue: string
  avgKdaText: string
  avgDamage: number
}

export interface FrequentTeammatesResponse {
  puuid: string
  analyzedMatches: number
  teammates: FrequentTeammate[]
  lastUpdatedAt: string
}

export function useRecentPlayers(
  puuid: string | undefined,
  count = 40,
  enabled = true
) {
  return useQuery({
    queryKey: ['recentPlayers', puuid, count],
    queryFn: async () => {
      const res = await apiClient.get<{ data: FrequentTeammatesResponse }>(
        `/api/recent-players/${puuid}?count=${count}`
      )

      return res.data.data
    },
    enabled: !!puuid && enabled,
    staleTime: 10 * 60 * 1000,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}