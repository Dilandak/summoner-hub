export function AppLoadingScreen({
  message = 'Preparando Summoner Hub...',
}: {
  message?: string
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden bg-rift-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(11,196,227,0.12),transparent_35%),radial-gradient(circle_at_50%_70%,rgba(200,155,60,0.10),transparent_35%)]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-rift-gold/20 blur-2xl animate-pulse" />

          <div className="relative w-28 h-28 rounded-2xl border border-rift-gold/40 bg-rift-panel flex items-center justify-center overflow-hidden shadow-[0_0_60px_rgba(200,155,60,0.18)]">
            <img
              src="/android-chrome-512x512.png"
              alt="DAK logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -inset-3 rounded-3xl border border-rift-blue/20 animate-ping" />
        </div>

        <p className="font-display text-3xl font-bold gold-text tracking-widest">
          SUMMONER HUB
        </p>

        <p className="font-mono text-xs uppercase tracking-[0.35em] text-rift-blue mt-2">
          DILANDAK#DAK · LAN
        </p>

        <div className="w-72 h-1 rounded-full bg-rift-border overflow-hidden mt-6">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-rift-gold/20 via-rift-gold to-rift-blue animate-[loadingBar_1.5s_ease-in-out_infinite]" />
        </div>

        <p className="font-mono text-xs text-rift-silver mt-4">
          {message}
        </p>
      </div>
    </div>
  )
}