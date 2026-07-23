import { useState } from 'react';
import { patchSession, createTarget } from '../api/api';
import type { ProgressionResult } from '../types';

interface SummaryExercise {
  exerciseName: string;
  exerciseId?: number;
  topSetWeight: number | null;
  topSetReps: number | null;
  progressionResult: ProgressionResult | null;
}

interface SessionSummaryProps {
  sessionId: number;
  sessionDate: string;
  sessionNotes: string;
  existingSessionNote: string;
  exercises: SummaryExercise[];
  onDone: () => void;
}

export default function SessionSummary({
  sessionId, sessionDate, sessionNotes, existingSessionNote, exercises, onDone,
}: SessionSummaryProps) {
  const [reflection, setReflection] = useState(existingSessionNote);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [dismissedGates, setDismissedGates] = useState<Set<string>>(new Set());
  const [targetWeights, setTargetWeights] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    exercises.forEach(ex => {
      if (ex.topSetWeight != null) {
        m[ex.exerciseName] = String(ex.topSetWeight + 2.5);
      }
    });
    return m;
  });

  const handleReflectionBlur = async () => {
    try {
      await patchSession(sessionId, { sessionNote: reflection, date: sessionDate, sessionNotes, sets: [] });
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 2000);
    } catch { /* silent */ }
  };

  const handleSetTarget = async (ex: SummaryExercise) => {
    if (!ex.exerciseId) return;
    const weight = Number(targetWeights[ex.exerciseName] || 0);
    if (weight <= 0) return;
    try {
      await createTarget({
        exerciseId: ex.exerciseId,
        targetWeight: weight,
        createdFromSessionId: sessionId,
      });
      setDismissedGates(prev => new Set(prev).add(ex.exerciseName));
    } catch { alert('Failed to set target.'); }
  };

  const dismissGate = (name: string) => {
    setDismissedGates(prev => new Set(prev).add(name));
  };

  const getTrendColor = (dir: string) => {
    switch (dir) {
      case 'UP': return '#7A9A6D';
      case 'DOWN': return '#B54A32';
      case 'STABLE': return '#8F8073';
      default: return 'var(--color-text-muted)';
    }
  };

  const getTrendLine = (pr: ProgressionResult) => {
    switch (pr.trendDirection) {
      case 'UP': return `↑ +${pr.percentageChange}% vs last session`;
      case 'DOWN': return `↓ ${pr.percentageChange}% vs last session`;
      case 'STABLE': return '→ Within normal variation';
      default: return 'First session logged';
    }
  };

  return (
    <div className="p-5 max-w-3xl mx-auto animate-fade-in" style={{ animationDuration: '0.5s' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--color-text-primary)',
          margin: '0 0 8px 0',
        }}>
          SESSION COMPLETE
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {sessionDate} {sessionNotes && `· ${sessionNotes}`}
        </p>
      </div>

      {/* Exercise Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {exercises.map((ex, i) => {
          const pr = ex.progressionResult;
          const isVolume = pr?.isVolumeRange ?? false;
          const showGate = pr && !isVolume && (pr.trendDirection === 'UP' || pr.trendDirection === 'STABLE') && !dismissedGates.has(ex.exerciseName);
          const isDown = pr && !isVolume && pr.trendDirection === 'DOWN';

          return (
            <div key={i} className="iron-card-static animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Exercise name */}
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--color-text-primary)', margin: '0 0 8px 0',
              }}>
                {ex.exerciseName}
              </h3>

              {/* Top Set info */}
              {ex.topSetWeight != null && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 8px 0' }}>
                  Top Set: {ex.topSetWeight}kg × {ex.topSetReps}
                </p>
              )}

              {isVolume ? (
                /* VOLUME FOCUS */
                <div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px',
                    background: 'rgba(143, 128, 115, 0.10)', color: '#8F8073',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderRadius: '6px',
                  }}>
                    VOLUME FOCUS
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Est. strength not calculated (reps &gt; 10)
                  </p>
                </div>
              ) : pr ? (
                /* Strength analysis */
                <div>
                  {/* e1RM value */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-accent-ember)', fontWeight: 700 }}>
                      Est. Relative Strength: {pr.referenceE1RM}kg
                    </span>
                    <span title="Estimated — personal trend tracking only" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '16px', height: '16px', borderRadius: '50%',
                      border: '1px solid var(--color-text-muted)', color: 'var(--color-text-muted)',
                      fontSize: '10px', cursor: 'help', flexShrink: 0,
                    }}>
                      i
                    </span>
                  </div>

                  {/* Trend line */}
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                    color: getTrendColor(pr.trendDirection), margin: '0 0 12px 0',
                  }}>
                    {getTrendLine(pr)}
                  </p>

                  {/* Decision Gate */}
                  {showGate && (
                    <div style={{
                      border: '1px solid var(--color-accent-ember)',
                      padding: '14px 16px', marginTop: '8px',
                      background: 'rgba(192, 133, 82, 0.05)',
                      borderRadius: '10px',
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 600,
                        textTransform: 'uppercase', color: 'var(--color-text-muted)',
                        letterSpacing: '0.06em', margin: '0 0 10px 0',
                      }}>
                        Target for next session:
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <input
                          type="number" step="0.5"
                          className="iron-input"
                          style={{ width: '100px', padding: '8px 10px', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                          value={targetWeights[ex.exerciseName] || ''}
                          onChange={e => setTargetWeights(prev => ({ ...prev, [ex.exerciseName]: e.target.value }))}
                        />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-muted)' }}>kg</span>
                        <button
                          onClick={() => handleSetTarget(ex)}
                          className="iron-btn iron-btn-primary"
                          style={{ padding: '8px 16px', fontSize: '11px' }}
                        >
                          Yes, set target
                        </button>
                        <button
                          onClick={() => dismissGate(ex.exerciseName)}
                          className="iron-btn"
                          style={{ padding: '8px 16px', fontSize: '11px', background: 'transparent', border: '1px solid var(--color-border-dim)', color: 'var(--color-text-muted)' }}
                        >
                          No thanks
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DOWN advice */}
                  {isDown && (
                    <p style={{
                      fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '4px',
                    }}>
                      Consider keeping the same weight next session.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Session Reflection */}
      <div className="iron-card-static" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            SESSION REFLECTION
          </label>
          {reflectionSaved && (
            <span style={{ fontSize: '11px', color: '#7A9A6D', fontFamily: 'var(--font-mono)' }}>
              ✓ Saved
            </span>
          )}
        </div>
        <textarea
          className="iron-input"
          rows={4}
          style={{ width: '100%', resize: 'vertical', fontSize: '13px', padding: '10px' }}
          placeholder="How did this feel? Sleep, stress, form notes — anything for future you."
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          onBlur={handleReflectionBlur}
        />
      </div>

      {/* Footer buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.href = '/session-history'}
          className="iron-btn"
          style={{
            padding: '14px 28px', fontSize: '13px',
            background: 'transparent', border: '1px solid var(--color-border-dim)',
            color: 'var(--color-text-secondary)',
          }}
        >
          VIEW HISTORY
        </button>
        <button
          onClick={onDone}
          className="iron-btn iron-btn-primary"
          style={{ padding: '14px 28px', fontSize: '13px' }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}
