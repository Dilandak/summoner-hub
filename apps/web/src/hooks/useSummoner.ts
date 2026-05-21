import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Summoner, RankedEntry } from '@summoner-hub/types'

const SUMMONER_NAME = 'Dilandak'

interface SummonerData {
  summoner: Summoner
  ranked: RankedEntry[]
}

export function useSummoner() {
  return useQuery({
    queryKey: ['summoner', SUMMONER_NAME],
    queryFn: async () => {
      const res = await apiClient.get<{ data: SummonerData }>(`/api/summoner/${SUMMONER_NAME}`)
      return res.data.data
    },
  })
}
