import { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Dashboard } from '@/pages/Dashboard'
import { Matches } from '@/pages/Matches'
import { Champions } from '@/pages/Champions'
import { Stats } from '@/pages/Stats'
import { AppLoadingScreen } from '@/components/ui/AppLoadingScreen'

import { useSummoner } from '@/hooks/useSummoner'
import { useProfileInsights } from '@/hooks/useProfileInsights'
import { useMastery } from '@/hooks/useMastery'
import { useMatches } from '@/hooks/useMatches'
import { useChampionStats } from '@/hooks/useChampionStats'
import { useRecentPlayers } from '@/hooks/useRecentPlayers'

export default function App() {
  const [bootFinished, setBootFinished] = useState(false)
  const [minimumTimeDone, setMinimumTimeDone] = useState(false)

  const summonerQuery = useSummoner()
  const puuid = summonerQuery.data?.account.puuid

  // Estas queries son las que necesita el Dashboard para verse completo.
  const insightsQuery = useProfileInsights(puuid, 30)
  const masteryQuery = useMastery(puuid, 6)
  const matchesQuery = useMatches(puuid, 10)
  const championStatsQuery = useChampionStats(puuid, 30)
  const recentPlayersQuery = useRecentPlayers(puuid, 80)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimeDone(true)
    }, 1600)

    return () => clearTimeout(timer)
  }, [])

  const isDashboardBootLoading = useMemo(() => {
    if (bootFinished) return false

    if (summonerQuery.isPending) return true

    if (!puuid) return true

    return (
      insightsQuery.isPending ||
      masteryQuery.isPending ||
      matchesQuery.isPending ||
      championStatsQuery.isPending ||
      recentPlayersQuery.isPending
    )
  }, [
    bootFinished,
    puuid,
    summonerQuery.isPending,
    insightsQuery.isPending,
    masteryQuery.isPending,
    matchesQuery.isPending,
    championStatsQuery.isPending,
    recentPlayersQuery.isPending,
  ])

  useEffect(() => {
    if (bootFinished) return

    if (minimumTimeDone && !isDashboardBootLoading) {
      setBootFinished(true)
    }
  }, [bootFinished, minimumTimeDone, isDashboardBootLoading])

  const loadingMessage = useMemo(() => {
    if (summonerQuery.isPending) return 'Conectando con Riot API...'
    if (insightsQuery.isPending) return 'Analizando rendimiento reciente...'
    if (masteryQuery.isPending) return 'Consultando maestrías...'
    if (matchesQuery.isPending) return 'Cargando historial de partidas...'
    if (championStatsQuery.isPending) return 'Calculando champion pool...'
    if (recentPlayersQuery.isPending) return 'Detectando dúos y compañeros frecuentes...'

    return 'Preparando dashboard...'
  }, [
    summonerQuery.isPending,
    insightsQuery.isPending,
    masteryQuery.isPending,
    matchesQuery.isPending,
    championStatsQuery.isPending,
    recentPlayersQuery.isPending,
  ])

  if (!bootFinished) {
    return <AppLoadingScreen message={loadingMessage} />
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/champions" element={<Champions />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}