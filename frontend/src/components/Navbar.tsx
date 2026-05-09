import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, ClipboardList, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/log', label: 'Log', icon: ClipboardList },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{
      background: 'rgba(8, 9, 13, 0.85)',
      borderBottom: '1px solid var(--color-border-dim)',
    }}>
      <div className="flex justify-between items-center max-w-5xl mx-auto px-4 py-3">
        <Link
          to="/"
          className="text-lg md:text-xl font-bold flex items-center gap-2.5 transition-colors duration-200"
          style={{ color: 'var(--color-text-primary)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-ember)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-ember) 0%, var(--color-accent-flame) 100%)',
              boxShadow: '0 2px 12px rgba(255, 107, 53, 0.3)',
            }}
          >
            <Dumbbell size={18} color="#fff" />
          </div>
          <span className="tracking-tight">
            Iron<span style={{ color: 'var(--color-accent-ember)' }}>Ledger</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  color: isActive ? 'var(--color-accent-ember)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-ember-dim)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className="relative flex items-center gap-1.5 px-3 py-2 ml-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200"
            style={{
              color: 'var(--color-text-secondary)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ff3b3b';
              e.currentTarget.style.background = 'rgba(255,59,59,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
