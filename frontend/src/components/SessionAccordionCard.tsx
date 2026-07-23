import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GradeBadge from './GradeBadge';

interface SessionAccordionCardProps {
  session: any; // SessionWithSetsDTO type
  onDelete?: (id: number) => void;
  onEdit?: (session: any) => void;
}

export default function SessionAccordionCard({ session, onDelete, onEdit }: SessionAccordionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="iron-card-static" style={{ marginBottom: '16px' }}>
      <div 
        onClick={() => setExpanded(!expanded)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px' }}>{session.date}</span>
          {session.sessionNotes && (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {session.sessionNotes}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <GradeBadge grade={session.topGrade} />
          <div style={{ display: 'flex', gap: '6px' }}>
            {onEdit && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(session);
                }}
                className="iron-btn"
                style={{ background: 'transparent', color: 'var(--color-text-primary)', padding: '4px 8px', border: '1px solid var(--color-border-dim)', borderRadius: '4px', fontSize: '12px' }}
                title="Edit Session"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this session?')) {
                    onDelete(session.id);
                  }
                }}
                className="iron-btn"
                style={{ background: 'transparent', color: '#B54A32', padding: '4px 8px', border: '1px solid #B54A32', borderRadius: '4px', fontSize: '12px' }}
                title="Delete Session"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-dim)' }}>
          
          {/* Session Note callout */}
          {session.sessionNote && (
            <div style={{
              borderLeft: '3px solid var(--color-accent-ember)',
              background: 'rgba(192, 133, 82, 0.05)',
              padding: '10px 14px', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.08em', marginBottom: '4px' }}>
                SESSION NOTE
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0 }}>
                {session.sessionNote}
              </p>
            </div>
          )}

          {session.sessionNotes && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
              "{session.sessionNotes}"
            </p>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {session.exercises?.map((block: any, i: number) => (
              <div key={i}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', margin: '0 0 8px 0', color: 'var(--color-accent-ember)' }}>
                  {block.exerciseName}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {block.sets?.map((set: any, j: number) => (
                    <div key={j} style={{ 
                      display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
                      fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-secondary)', 
                      paddingLeft: '8px', borderLeft: set.isTopSet ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                    }}>
                      <span style={{ width: '40px', flexShrink: 0 }}>Set {j+1}</span>
                      <span>{set.weight}kg × {set.reps}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>RPE {set.rpe}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {set.rir != null ? `RIR ${set.rir}` : '—'}
                      </span>
                      {set.setNote && (
                        <span title={set.setNote} style={{ cursor: 'help', fontSize: '12px' }}>📝</span>
                      )}
                      {set.isTopSet && <span style={{ color: 'var(--color-accent-gold)', fontSize: '10px' }}>★</span>}
                      
                      {/* e1RM or Volume Focus indicator */}
                      {set.reps > 10 ? (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                          color: '#8F8073', letterSpacing: '0.04em',
                        }}>
                          VOLUME FOCUS
                        </span>
                      ) : set.isTopSet && set.weight && set.reps && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#7A9A6D' }}>
                            Est. Relative Strength: {calculateSimpleE1RM(set.weight, set.reps)}kg
                          </span>
                          <span title="Estimated — personal trend tracking only" style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '13px', height: '13px', borderRadius: '50%',
                            border: '1px solid var(--color-text-muted)', color: 'var(--color-text-muted)',
                            fontSize: '8px', cursor: 'help', flexShrink: 0,
                          }}>
                            i
                          </span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(!session.exercises || session.exercises.length === 0) && (
              <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '13px' }}>No sets logged.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple e1RM calculation for display in history
function calculateSimpleE1RM(weight: number, reps: number): string {
  if (reps === 1) return weight.toFixed(1);
  if (reps >= 2 && reps <= 5) return (weight * 36.0 / (37.0 - reps)).toFixed(1);
  if (reps >= 6 && reps <= 10) return (weight * (1.0 + reps / 30.0)).toFixed(1);
  return '—';
}
