import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { ChampionMastery } from '@summoner-hub/types'

export function useMastery(puuid: string | undefined, count = 7) {
  return useQuery({
    queryKey: ['mastery', puuid, count],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ChampionMastery[] }>(`/api/mastery/${puuid}?count=${count}`)
      return res.data.data
    },
    enabled: !!puuid,
    staleTime: 10 * 60 * 1000,
  })
}
