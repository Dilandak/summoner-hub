import { useQuery } from '@tanstack/react-query'

export interface ChampionMeta {
  id: string
  key: number
  name: string
  title: string
  squareUrl: string
  splashUrl: string
  loadingUrl: string
}

type DDragonChampion = {
  id: string
  key: string
  name: string
  title: string
}

type DDragonResponse = {
  data: Record<string, DDragonChampion>
}

export function useChampionIndex() {
  return useQuery({
    queryKey: ['championIndex'],
    queryFn: async () => {
      const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      const versions = await versionsRes.json() as string[]
      const version = versions[0]

      const champsRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/es_MX/champion.json`
      )

      const champs = await champsRes.json() as DDragonResponse

      const byKey: Record<number, ChampionMeta> = {}
      const byId: Record<string, ChampionMeta> = {}

      Object.values(champs.data).forEach(champ => {
        const meta: ChampionMeta = {
          id: champ.id,
          key: Number(champ.key),
          name: champ.name,
          title: champ.title,
          squareUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`,
          splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`,
          loadingUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`,
        }

        byKey[meta.key] = meta
        byId[meta.id.toLowerCase()] = meta
      })

      return {
        version,
        byKey,
        byId,
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}