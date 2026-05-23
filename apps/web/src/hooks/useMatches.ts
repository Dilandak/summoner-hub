import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { MatchSummary } from '@summoner-hub/types'

export function useMatches(puuid: string | undefined, count = 10) {
  return useQuery({
    queryKey: ['matches', puuid, count],
    queryFn: async () => {
      const res = await apiClient.get<{ data: MatchSummary[] }>(
        `/api/matches/${puuid}?count=${count}`
      )

      return res.data.data
    },
    enabled: !!puuid,
    placeholderData: previousData => previousData,
    staleTime: 3 * 60 * 1000,
  })
}