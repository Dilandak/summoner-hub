export function LoadingRift({ message = 'Cargando desde el Rift...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-rift-gold/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-rift-gold/40 animate-spin" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-4 rounded-full bg-rift-gold/20 animate-pulse" />
      </div>
      <p className="font-mono text-sm text-rift-gold/60 tracking-widest uppercase">{message}</p>
    </div>
  )
}
