import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Summoner, RankedEntry } from '@summoner-hub/types'

const GAME_NAME = import.meta.env.VITE_RIOT_GAME_NAME ?? 'Dilandak'
const TAG_LINE = import.meta.env.VITE_RIOT_TAG_LINE ?? 'Dak'

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface SummonerData {
  account: RiotAccount
  summoner: Summoner
  ranked: RankedEntry[]
}

export function useSummoner() {
  return useQuery({
    queryKey: ['summoner', GAME_NAME, TAG_LINE],
    queryFn: async () => {
      const res = await apiClient.get<{ data: SummonerData }>('/api/summoner', {
        params: {
          gameName: GAME_NAME,
          tagLine: TAG_LINE,
        },
      })

      return res.data.data
    },
  })
}