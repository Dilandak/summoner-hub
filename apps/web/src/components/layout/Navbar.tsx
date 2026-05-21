import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/matches', label: 'Partidas' },
  { to: '/champions', label: 'Mains' },
  { to: '/stats', label: 'Stats' },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-rift-border/50"
      style={{ background: 'rgba(1,10,19,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 py-0 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-xl gold-text tracking-wider">SUMMONER</span>
          <span className="font-mono text-rift-blue text-xs border border-rift-blue/40 rounded px-1.5 py-0.5">HUB</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`font-mono text-sm px-4 py-2 rounded transition-all duration-200
                ${pathname === l.to
                  ? 'text-rift-gold bg-rift-gold/10 border border-rift-gold/30'
                  : 'text-rift-silver hover:text-rift-gold hover:bg-rift-gold/5'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Summoner name tag */}
        <div className="flex items-center gap-2 border border-rift-gold/20 rounded-full px-3 py-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-rift-gold">Dilandak #Dak</span>
        </div>
      </div>
    </nav>
  )
}
