import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useSummoner } from '@/hooks/useSummoner'
import { useLiveGame } from '@/hooks/useLiveGame'
import { ddragon } from '@/api/client'
import { getSoloQ, getWinRate } from '@/utils/lol'
import { RankBadge } from '@/components/ui/RankBadge'
import { WinLossBar } from '@/components/ui/WinLossBar'
import { LoadingRift } from '@/components/ui/LoadingRift'

export function ProfileHero() {
  const { data, isLoading } = useSummoner()
  const heroRef  = useRef<HTMLDivElement>(null)
  const iconRef  = useRef<HTMLImageElement>(null)
  const textRef  = useRef<HTMLDivElement>(null)

  const soloQ    = data ? getSoloQ(data.ranked) : null
  const { data: liveGame } = useLiveGame(data?.summoner.id)

  useEffect(() => {
    if (!data || !heroRef.current) return
    const tl = gsap.timeline()
    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .fromTo(iconRef.current, { scale: 0.5, rotation: -10, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.4')
      .fromTo(textRef.current?.children ?? [], { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    // Parallax en scroll
    gsap.to(iconRef.current, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
    })
  }, [data])

  if (isLoading) return <LoadingRift message="Invocando a Dilandak..." />

  return (
    <div ref={heroRef} className="relative overflow-hidden rounded-2xl opacity-0" style={{
      background: 'linear-gradient(135deg, #0A1428 0%, #0D2137 60%, #1a0a00 100%)',
      border: '1px solid rgba(200,155,60,0.2)',
    }}>
      {/* Splash art de fondo del main (lo cargarás cuando configures el campeón favorito) */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Draven_0.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,20,40,0.95) 40%, rgba(10,20,40,0.6) 100%)' }} />

      {/* Live indicator */}
      {liveGame && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1 z-10">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-red-300 text-xs font-mono font-bold uppercase tracking-widest">En partida</span>
        </div>
      )}

      <div className="relative z-10 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Icono */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full animate-glow-pulse" style={{ boxShadow: '0 0 40px rgba(200,155,60,0.3)' }} />
          <img ref={iconRef}
            src={ddragon.profileIcon(data?.summoner.profileIconId ?? 1)}
            alt="Profile icon"
            className="w-28 h-28 rounded-full border-2 border-rift-gold/60 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/1.png' }}
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rift-navy border border-rift-gold/40 rounded-full px-3 py-0.5">
            <span className="font-mono text-xs text-rift-gold font-bold">Nv. {data?.summoner.summonerLevel}</span>
          </div>
        </div>

        {/* Info */}
        <div ref={textRef} className="flex-1 text-center md:text-left space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-bold gold-text tracking-wide">
            {data?.summoner.name ?? 'Dilandak'}
          </h1>

          {soloQ ? (
            <>
              <RankBadge tier={soloQ.tier} division={soloQ.rank} lp={soloQ.leaguePoints} size="md" />
              <div className="max-w-xs">
                <WinLossBar wins={soloQ.wins} losses={soloQ.losses} />
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {soloQ.hotStreak && (
                  <span className="text-xs font-mono bg-orange-500/20 border border-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full">🔥 Racha de victorias</span>
                )}
                {soloQ.veteran && (
                  <span className="text-xs font-mono bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">⚔️ Veterano</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-rift-silver font-mono text-sm">Sin partidas clasificatorias esta temporada</p>
          )}
        </div>

        {/* Stats rápidos */}
        {soloQ && (
          <div className="flex flex-col gap-3 text-center min-w-[120px]">
            <div className="rift-card p-3">
              <p className="text-rift-gold/50 text-xs uppercase tracking-widest font-mono">Winrate</p>
              <p className="font-display text-3xl font-bold gold-text">{getWinRate(soloQ.wins, soloQ.losses)}%</p>
            </div>
            <div className="rift-card p-3">
              <p className="text-rift-gold/50 text-xs uppercase tracking-widest font-mono">Partidas</p>
              <p className="font-display text-3xl font-bold text-rift-gold2">{soloQ.wins + soloQ.losses}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
