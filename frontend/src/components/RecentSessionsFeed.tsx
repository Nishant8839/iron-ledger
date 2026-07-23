

export interface RecentSession {
  id: number;
  date: string;
  exercises: string;
  topGrade: string;
}

interface RecentSessionsFeedProps {
  sessions: RecentSession[];
}

export default function RecentSessionsFeed({ sessions }: RecentSessionsFeedProps) {
  
  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'PLATINUM': return '#7A9A6D';
      case 'GOLD': return '#C08552';
      case 'SILVER': return '#8F8073';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontSize: '18px' }}>Recent Sessions</h3>
      {sessions.map(s => (
        <div key={s.id} className="iron-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '60%' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-text-primary)' }}>
              {s.date}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.exercises || 'No exercises logged'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <div style={{ 
              padding: '4px 8px', 
              backgroundColor: getGradeColor(s.topGrade),
              color: '#fff',
              fontWeight: 600,
              fontFamily: 'var(--font-display)', 
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '6px',
            }}>
              {s.topGrade}
            </div>
          </div>

        </div>
      ))}
      {sessions.length === 0 && (
        <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>No recent sessions found.</div>
      )}
    </div>
  );
}
