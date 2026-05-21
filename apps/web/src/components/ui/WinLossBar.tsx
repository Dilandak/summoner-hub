interface Props { wins: number; losses: number }
export function WinLossBar({ wins, losses }: Props) {
  const total = wins + losses
  const wr = total === 0 ? 0 : Math.round((wins / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-green-400">{wins}W</span>
        <span className={`font-bold ${wr >= 55 ? 'text-rift-gold' : 'text-rift-silver'}`}>{wr}%</span>
        <span className="text-red-400">{losses}L</span>
      </div>
      <div className="h-1.5 rounded-full bg-red-500/30 overflow-hidden">
        <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${wr}%` }} />
      </div>
    </div>
  )
}
