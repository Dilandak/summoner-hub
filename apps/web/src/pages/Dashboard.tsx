import { useSummoner } from '@/hooks/useSummoner'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { MatchList } from '@/components/matches/MatchList'
import { ChampionGrid } from '@/components/champions/ChampionGrid'

export function Dashboard() {
  const { data } = useSummoner()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero con perfil */}
      <ProfileHero />

      {/* Mis mains */}
      <section>
        <SectionHeader title="Mis Mains" sub="Maestría de campeones" />
        {data && <ChampionGrid puuid={data.summoner.puuid} />}
      </section>

      {/* Últimas partidas */}
      <section>
        <SectionHeader title="Últimas Partidas" sub="Historial reciente — Ranked Solo/Duo" />
        {data && <MatchList puuid={data.summoner.puuid} />}
      </section>
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-bold text-rift-gold2">{title}</h2>
      <p className="font-mono text-sm text-rift-silver mt-1">{sub}</p>
      <div className="gold-divider mt-3" />
    </div>
  )
}
