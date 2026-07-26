import { NavLink } from 'react-router-dom';
import { Activity, History } from 'lucide-react';

const linkBase =
  'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 group">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-pulse-500/15 border border-pulse-500/30">
            <Activity className="w-4 h-4 text-pulse-400" />
            <span className="absolute inset-0 rounded-lg bg-pulse-500/20 animate-blink" />
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-slate-50">
            Page Pulse
          </span>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-pulse-400 bg-white/5' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            Audit
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-pulse-400 bg-white/5' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            <History className="w-3.5 h-3.5" />
            History
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
