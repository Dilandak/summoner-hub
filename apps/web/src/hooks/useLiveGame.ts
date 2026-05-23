import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { LiveGame } from '@summoner-hub/types'

export function useLiveGame(puuid: string | undefined) {
  return useQuery({
    queryKey: ['liveGame', puuid],
    queryFn: async () => {
      const res = await apiClient.get<{ data: LiveGame | null }>(`/api/live/${puuid}`)
      return res.data.data
    },
    enabled: !!puuid,
    refetchInterval: 30_000,
    staleTime: 0,
  })
}