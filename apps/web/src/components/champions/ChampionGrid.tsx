import { useMastery } from '@/hooks/useMastery'
import { ChampionCard } from './ChampionCard'
import { LoadingRift } from '@/components/ui/LoadingRift'

// Mapa básico de IDs a nombres — se puede poblar dinámicamente desde Data Dragon
const CHAMP_NAMES: Record<number, string> = {
  119: 'Draven', 222: 'Jinx', 81: 'Ezreal', 51: 'Caitlyn', 22: 'Ashe',
  21: 'MissFortune', 67: 'Vayne', 236: 'Lucian', 15: 'Sivir', 29: 'Twitch',
  202: 'Jhin', 145: 'Kaisa', 498: 'Xayah', 412: 'Thresh', 89: 'Leona',
  // Agrega aquí los campeones que juegas más
}

interface Props { puuid: string }

export function ChampionGrid({ puuid }: Props) {
  const { data: masteries, isLoading } = useMastery(puuid, 6)

  if (isLoading) return <LoadingRift message="Consultando maestrías..." />

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {masteries?.map((m, i) => {
        const name = CHAMP_NAMES[m.championId] ?? `Champ_${m.championId}`
        return <ChampionCard key={m.championId} mastery={m} champName={name} rank={i + 1} />
      })}
    </div>
  )
}
