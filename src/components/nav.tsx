import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-border-primary bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-neon-green font-bold text-sm tracking-wider">
            RAGE QUIT
          </span>
          <span className="text-text-muted text-xs">TRACKER</span>
          <span className="w-2 h-2 rounded-full bg-neon-green animate-gauge-pulse" />
        </Link>
        <div className="flex items-center gap-6 text-xs">
          <Link
            href="/"
            className="text-text-secondary hover:text-neon-green transition-colors duration-150"
          >
            DEPARTURES
          </Link>
          <Link
            href="/timeline"
            className="text-text-secondary hover:text-neon-green transition-colors duration-150"
          >
            TIMELINE
          </Link>
          <Link
            href="/stats"
            className="text-text-secondary hover:text-neon-green transition-colors duration-150"
          >
            STATS
          </Link>
        </div>
      </div>
    </nav>
  );
}
