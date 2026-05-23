import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

interface RefreshProfilePayload {
  puuid: string
  gameName: string
  tagLine: string
}

export function useRefreshProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RefreshProfilePayload) => {
      const res = await apiClient.post('/api/refresh/profile', payload)
      return res.data
    },

    onSuccess: async (_, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['summoner', payload.gameName, payload.tagLine],
        }),

        queryClient.invalidateQueries({
          queryKey: ['profileInsights', payload.puuid],
          exact: false,
        }),

        queryClient.invalidateQueries({
          queryKey: ['mastery', payload.puuid],
          exact: false,
        }),

        queryClient.invalidateQueries({
          queryKey: ['matches', payload.puuid],
          exact: false,
        }),

        queryClient.invalidateQueries({
          queryKey: ['liveGame', payload.puuid],
          exact: false,
        }),
      ])
    },
  })
}