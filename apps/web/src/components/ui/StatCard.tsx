interface Props { label: string; value: string | number; sub?: string; accent?: boolean }
export function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div className={`rift-card p-4 text-center ${accent ? 'border-rift-gold/30' : ''}`}>
      <p className="text-rift-gold/50 text-xs uppercase tracking-widest font-mono mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${accent ? 'gold-text' : 'text-rift-gold2'}`}>{value}</p>
      {sub && <p className="text-rift-silver text-xs mt-1 font-mono">{sub}</p>}
    </div>
  )
}
