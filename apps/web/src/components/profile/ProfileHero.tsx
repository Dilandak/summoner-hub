import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSummoner } from "@/hooks/useSummoner";
import { useLiveGame } from "@/hooks/useLiveGame";
import { useProfileInsights } from "@/hooks/useProfileInsights";
import { ddragon } from "@/api/client";
import { getSoloQ, getWinRate } from "@/utils/lol";
import { RankBadge } from "@/components/ui/RankBadge";
import { WinLossBar } from "@/components/ui/WinLossBar";
import { LoadingRift } from "@/components/ui/LoadingRift";
import { useRefreshProfile } from "@/hooks/useRefreshProfile";

export function ProfileHero() {
  const { data, isLoading } = useSummoner();

  const heroRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const soloQ = data ? getSoloQ(data.ranked) : null;

  const { data: liveGame } = useLiveGame(data?.account.puuid);

  const { data: insights, isLoading: insightsLoading } = useProfileInsights(
    data?.account.puuid,
    10,
  );

  const recentMain = insights?.recentMain;

  const refreshProfile = useRefreshProfile();

  const handleRefresh = () => {
    if (!data) return;

    refreshProfile.mutate({
      puuid: data.account.puuid,
      gameName: data.account.gameName,
      tagLine: data.account.tagLine,
    });
  };

  useEffect(() => {
    if (!data || !heroRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
    )
      .fromTo(
        iconRef.current,
        { scale: 0.7, rotation: -8, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.65,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )
      .fromTo(
        textRef.current?.children ?? [],
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out" },
        "-=0.3",
      );
  }, [data, recentMain?.championName]);

  if (isLoading) {
    return <LoadingRift message="Invocando a Dilandak..." />;
  }

  if (!data) return null;

  const riotId = `${data.account.gameName}#${data.account.tagLine}`;
  const heroBackground = recentMain?.splashUrl;

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden rounded-2xl opacity-0 min-h-[260px]"
      style={{
        border: "1px solid rgba(200,155,60,0.22)",
        backgroundColor: "#010A13",
        backgroundImage: heroBackground
          ? `
      linear-gradient(90deg, rgba(1,10,19,0.96) 0%, rgba(10,20,40,0.88) 38%, rgba(10,20,40,0.52) 65%, rgba(1,10,19,0.82) 100%),
      linear-gradient(180deg, rgba(1,10,19,0.10) 0%, rgba(1,10,19,0.94) 100%),
      url(${heroBackground})
    `
          : "linear-gradient(135deg, #0A1428 0%, #0D2137 60%, #1a0a00 100%)",
        backgroundSize: heroBackground ? "cover, cover, cover" : "cover",
        backgroundPosition: heroBackground
          ? "center, center, center 18%"
          : "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(11,196,227,0.20),transparent_32%),radial-gradient(circle_at_18%_80%,rgba(200,155,60,0.16),transparent_38%)]" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(1,10,19,0.96) 0%, transparent 55%)",
        }}
      />

      {liveGame && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1 z-20">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-red-300 text-xs font-mono font-bold uppercase tracking-widest">
            En partida
          </span>
        </div>
      )}

      <div className="relative z-10 p-8 flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
  <div className="relative">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{ boxShadow: "0 0 55px rgba(200,155,60,0.35)" }}
    />

    <img
      ref={iconRef}
      src={ddragon.profileIcon(data.summoner.profileIconId)}
      alt="Profile icon"
      className="relative z-10 w-28 h-28 rounded-2xl border border-rift-gold/60 object-cover shadow-[0_0_28px_rgba(200,155,60,0.22)]"
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          "https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/1.png";
      }}
    />

<div className="absolute -bottom-[29px] left-1/2 -translate-x-1/2 z-20">
  <span className="font-mono text-[17px] text-rift-gold font-bold leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]">
    {data.summoner.summonerLevel}
  </span>
</div>
  </div>

  <button
    type="button"
    onClick={handleRefresh}
    disabled={refreshProfile.isPending}
    className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] border border-rift-gold/40 text-rift-gold rounded-full px-4 py-2 bg-rift-dark/70 hover:bg-rift-gold/10 hover:border-rift-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(200,155,60,0.12)]"
  >
    {refreshProfile.isPending ? "Actualizando..." : "Actualizar datos"}
  </button>
</div>

        <div
          ref={textRef}
          className="flex-1 text-center lg:text-left space-y-4"
        >
          <div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-rift-blue border border-rift-blue/30 rounded-full px-2 py-0.5 bg-rift-blue/10">
                {insights?.regionLabel ?? "LAN"}
              </span>

              {soloQ && (
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-rift-gold/70">
                  Solo/Duo
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold gold-text tracking-wide uppercase">
              {riotId}
            </h1>
          </div>

          {soloQ ? (
            <div className="space-y-3">
              <RankBadge
                tier={soloQ.tier}
                division={soloQ.rank}
                lp={soloQ.leaguePoints}
                size="md"
              />

              <div className="max-w-sm mx-auto lg:mx-0">
                <WinLossBar wins={soloQ.wins} losses={soloQ.losses} />
              </div>

              <p className="font-mono text-xs text-rift-silver">
                <span className="text-green-400">{soloQ.wins}W</span>
                <span className="text-rift-silver"> / </span>
                <span className="text-red-400">{soloQ.losses}L</span>
                <span className="text-rift-gold ml-2">
                  · {getWinRate(soloQ.wins, soloQ.losses)}% WR
                </span>
                {soloQ.hotStreak && (
                  <span className="text-orange-300 ml-2">· Hot Streak</span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-rift-silver font-mono text-sm">
              Sin clasificatorias Solo/Duo esta temporada
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
            <HeroInsightCard
              label="Campeón más jugado"
              value={
                insightsLoading
                  ? "Analizando..."
                  : (recentMain?.championName ?? "Sin datos")
              }
              sub={
                recentMain
                  ? `${recentMain.games} partidas recientes`
                  : "Últimas partidas reales"
              }
              image={recentMain?.squareUrl}
              accent
            />

            <HeroInsightCard
              label="Winrate reciente"
              value={recentMain ? `${recentMain.winRate}%` : "—"}
              sub={
                recentMain
                  ? `${recentMain.wins}W / ${recentMain.losses}L con ${recentMain.championName}`
                  : "Sin partidas analizadas"
              }
            />

            <HeroInsightCard
              label="KDA promedio"
              value={recentMain?.kdaText ?? "—"}
              sub={recentMain ? `Con ${recentMain.championName}` : "Sin datos"}
            />

            <HeroInsightCard
              label="Lado favorito"
              value={insights?.sidePreference.favorite ?? "—"}
              sub={
                insights
                  ? `Azul ${insights.sidePreference.blueRate}% · Rojo ${insights.sidePreference.redRate}%`
                  : "Calculado con partidas reales"
              }
            />
          </div>

          {recentMain && (
            <p className="font-mono text-xs text-rift-gold/70 pt-1">
              Main actual:{" "}
              <span className="text-rift-gold">{recentMain.championName}</span>
              <span className="mx-2 text-rift-silver">·</span>
              {insights?.analyzedMatches ?? 0} partidas recientes analizadas
            </p>
          )}
        </div>

        {soloQ && (
          <div className="flex lg:flex-col gap-3 text-center min-w-[120px]">
            <div className="rift-card p-3 min-w-[110px]">
              <p className="text-rift-gold/50 text-xs uppercase tracking-widest font-mono">
                Winrate
              </p>
              <p className="font-display text-3xl font-bold gold-text">
                {getWinRate(soloQ.wins, soloQ.losses)}%
              </p>
            </div>

            <div className="rift-card p-3 min-w-[110px]">
              <p className="text-rift-gold/50 text-xs uppercase tracking-widest font-mono">
                Partidas
              </p>
              <p className="font-display text-3xl font-bold text-rift-gold2">
                {soloQ.wins + soloQ.losses}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroInsightCard({
  label,
  value,
  sub,
  image,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  image?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rift-card p-3 text-left ${accent ? "border-rift-gold/40" : ""}`}
    >
      <div className="flex items-center gap-3">
        {image && (
          <img
            src={image}
            alt={value}
            className="w-10 h-10 rounded-lg object-cover border border-rift-gold/30"
          />
        )}

        <div className="min-w-0">
          <p className="text-rift-gold/50 text-[10px] uppercase tracking-widest font-mono mb-1">
            {label}
          </p>

          <p
            className={`font-display text-lg font-bold truncate ${accent ? "gold-text" : "text-rift-gold2"}`}
          >
            {value}
          </p>

          {sub && (
            <p className="text-rift-silver text-xs mt-0.5 font-mono truncate">
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
