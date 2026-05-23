import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

export type SidePreference = 'Azul' | 'Rojo' | 'Equilibrado'

export interface ChampionRecentStats {
  championName: string
  games: number
  wins: number
  losses: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  kdaText: string
  lastPlayedAt: number
  splashUrl: string
  loadingUrl: string
  squareUrl: string
}

export interface ProfileInsights {
  puuid: string
  regionLabel: string
  analyzedMatches: number
  recentMain: ChampionRecentStats | null
  sidePreference: {
    favorite: SidePreference
    blueGames: number
    redGames: number
    blueRate: number
    redRate: number
  }
  lastUpdatedAt: string
}

export function useProfileInsights(puuid: string | undefined, count = 50) {
  return useQuery({
    queryKey: ['profileInsights', puuid, count],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ProfileInsights }>(
        `/api/insights/${puuid}?count=${count}`
      )

      return res.data.data
    },
    enabled: !!puuid,
    staleTime: 3 * 60 * 1000,
  })
}