import { useSummoner } from '@/hooks/useSummoner'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { MatchList } from '@/components/matches/MatchList'
import { ChampionGrid } from '@/components/champions/ChampionGrid'
import { LoadingRift } from '@/components/ui/LoadingRift'
import { RecentPlayersSection } from '@/components/players/RecentPlayersSection'

export function Dashboard() {
  const { data, isLoading, error } = useSummoner()

  if (isLoading) {
    return <LoadingRift message="Calculando dashboard..." />
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rift-card p-6 text-center">
          <h1 className="font-display text-2xl text-red-400 font-bold">
            No se pudo cargar el invocador
          </h1>
          <p className="font-mono text-sm text-rift-silver mt-2">
            Revisa que la API esté corriendo y que Riot API responda correctamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <ProfileHero />

      <section>
        <SectionHeader title="Mis Mains" sub="Maestría de campeones" />
        <ChampionGrid puuid={data.account.puuid} count={6} statsCount={30} />
      </section>

      <section>
        <SectionHeader
          title="Últimas Partidas"
          sub="Historial reciente — todas las colas recientes"
        />
        <MatchList puuid={data.account.puuid} />
      </section>

      <section>
        <RecentPlayersSection puuid={data.account.puuid} count={80} />
      </section>
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-bold text-rift-gold2">
        {title}
      </h2>
      <p className="font-mono text-sm text-rift-silver mt-1">{sub}</p>
      <div className="gold-divider mt-3" />
    </div>
  )
}