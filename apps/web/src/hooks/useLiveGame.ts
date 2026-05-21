import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { LiveGame } from '@summoner-hub/types'

export function useLiveGame(summonerId: string | undefined) {
  return useQuery({
    queryKey: ['liveGame', summonerId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: LiveGame | null }>(`/api/live/${summonerId}`)
      return res.data.data
    },
    enabled: !!summonerId,
    refetchInterval: 30_000,
    staleTime: 0,
  })
}
