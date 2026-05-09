

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
      case 'PLATINUM': return '#39FF14';
      case 'GOLD': return '#FFD700';
      case 'SILVER': return '#C0C0C0';
      default: return '#555';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontSize: '18px' }}>Recent Sessions</h3>
      {sessions.map(s => (
        <div key={s.id} className="iron-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '60%' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-text)' }}>
              {s.date}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.exercises || 'No exercises logged'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <div style={{ 
              padding: '4px 8px', 
              backgroundColor: getGradeColor(s.topGrade),
              color: s.topGrade === 'BASELINE' || s.topGrade === 'SILVER' ? '#000' : '#111',
              fontWeight: 600,
              fontFamily: 'var(--font-display)', 
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {s.topGrade}
            </div>
          </div>

        </div>
      ))}
      {sessions.length === 0 && (
        <div style={{ color: '#555', fontFamily: 'var(--font-display)' }}>No recent sessions found.</div>
      )}
    </div>
  );
}
