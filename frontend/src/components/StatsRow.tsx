import React from 'react';

export interface DashboardStats {
  highestTopSet: number;
  totalSessions: number;
  currentStreak: number;
}

interface StatsRowProps {
  stats: DashboardStats;
}

export default function StatsRow({ stats }: StatsRowProps) {
  const cardStyle: React.CSSProperties = {
    flex: '1 1 200px',
    border: '1px solid var(--color-border)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
  };

  const hoverEffect = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 107, 53, 0.3)';
  };

  const removeHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
      
      {/* Card 1 */}
      <div className="iron-card" style={cardStyle} onMouseEnter={hoverEffect} onMouseLeave={removeHover}>
        <div style={{ fontFamily: 'var(--font-display)', color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          HIGHEST TOP SET
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-accent-ember)', margin: '8px 0' }}>
          {stats.highestTopSet}kg
        </div>
        <div style={{ fontFamily: 'var(--font-display)', color: '#555', fontSize: '12px' }}>
          this month
        </div>
      </div>

      {/* Card 2 */}
      <div className="iron-card" style={cardStyle} onMouseEnter={hoverEffect} onMouseLeave={removeHover}>
        <div style={{ fontFamily: 'var(--font-display)', color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          SESSIONS
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-accent-ember)', margin: '8px 0' }}>
          {stats.totalSessions}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', color: '#555', fontSize: '12px' }}>
          logged all time
        </div>
      </div>

      {/* Card 3 */}
      <div className="iron-card" style={cardStyle} onMouseEnter={hoverEffect} onMouseLeave={removeHover}>
        <div style={{ fontFamily: 'var(--font-display)', color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          CURRENT STREAK
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--color-accent-ember)', margin: '8px 0' }}>
          {stats.currentStreak} days
        </div>
        <div style={{ fontFamily: 'var(--font-display)', color: '#555', fontSize: '12px' }}>
          consecutive
        </div>
      </div>


    </div>
  );
}
