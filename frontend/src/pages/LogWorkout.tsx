import { useEffect, useState } from 'react';
import { getExercises, logSet, createSession, patchSession, getTargets, completeTarget, skipTarget } from '../api/api';
import type { Exercise, LoggedSet, ProgressionAlert, ProgressionResult, NextSessionTarget } from '../types';
import GradeBadge from '../components/GradeBadge';
import ProgressionBanner from '../components/ProgressionBanner';
import SessionSummary from '../components/SessionSummary';
import { Plus, Trash2, ChevronDown, ChevronUp, Dumbbell, CheckCircle } from 'lucide-react';

interface SetDraft {
  weight: string;
  reps: string;
  rpe: string;
  rir: string;
  setNote: string;
  showNote: boolean;
  isTopSet: boolean;
  logged: boolean;
  result?: LoggedSet;
  progressionResult?: ProgressionResult | null;
}

interface ExerciseBlock {
  id: string;
  exerciseName: string;
  exerciseId?: number;
  sets: SetDraft[];
  expanded: boolean;
  alert?: ProgressionAlert | null;
  target?: NextSessionTarget | null;
}

const newSetDraft = (): SetDraft => ({
  weight: '', reps: '', rpe: '', rir: '', setNote: '', showNote: false, isTopSet: false, logged: false,
});

export default function LogWorkout() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessionStep, setSessionStep] = useState<'create' | 'logging' | 'summary'>('create');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessionCreating, setSessionCreating] = useState(false);
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([]);
  const [pendingExerciseName, setPendingExerciseName] = useState('');
  const [liveSessionNote, setLiveSessionNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => { getExercises().then(setExercises); }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSessionCreating(true);
    try {
      const session = await createSession({ date: sessionDate, sessionNotes });
      setActiveSessionId(session.id);
      setSessionStep('logging');
    } catch (e: any) { 
      console.error('Session creation error:', e);
      alert('Failed to create session. Error: ' + (e.response?.data?.message || e.message || e)); 
    }
    finally { setSessionCreating(false); }
  };

  const handleSessionNoteBlur = async () => {
    if (!activeSessionId) return;
    try {
      await patchSession(activeSessionId, { sessionNote: liveSessionNote, date: sessionDate, sessionNotes, sets: [] });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch { /* silent */ }
  };

  const addExerciseBlock = async () => {
    if (!pendingExerciseName) return;
    const matchedExercise = exercises.find(ex => ex.name.toLowerCase() === pendingExerciseName.toLowerCase());
    const newBlock: ExerciseBlock = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
      exerciseName: pendingExerciseName,
      exerciseId: matchedExercise?.id,
      sets: [newSetDraft()],
      expanded: true,
      target: null,
    };

    // Fetch pending target if exercise is known
    if (matchedExercise) {
      try {
        const targets = await getTargets(matchedExercise.id, 'PENDING');
        if (targets.length > 0) {
          newBlock.target = targets[0];
          newBlock.sets[0].weight = String(targets[0].targetWeight);
        }
      } catch { /* no target */ }
    }

    setBlocks(prev => [...prev, newBlock]);
    setPendingExerciseName('');
  };

  const dismissTarget = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.target) return;
    try {
      await skipTarget(block.target.id);
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, target: null } : b));
    } catch { /* silent */ }
  };

  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
  const toggleBlock = (id: string) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, expanded: !b.expanded } : b));
  const addSet = (id: string) => setBlocks(prev => prev.map(b => b.id !== id ? b : { ...b, sets: [...b.sets, newSetDraft()] }));

  const updateSetField = (blockId: string, idx: number, field: keyof SetDraft, value: string | boolean) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      let newSets = [...b.sets];
      
      // Top Set Single Enforcement
      if (field === 'isTopSet' && value === true) {
        newSets = newSets.map((s, i) => ({ ...s, isTopSet: i === idx }));
      } else {
        newSets[idx] = { ...newSets[idx], [field]: value };
      }
      
      return { ...b, sets: newSets };
    }));
  };

  const handleLogSet = async (blockId: string, idx: number) => {
    if (!activeSessionId) return;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const s = block.sets[idx];
    if (!s.weight || !s.reps || !s.rpe) { alert('Fill weight, reps, RPE.'); return; }
    try {
      const resp = await logSet({
        exerciseName: block.exerciseName, sessionId: activeSessionId,
        weight: Number(s.weight), reps: Number(s.reps), rpe: Number(s.rpe),
        rir: s.rir ? Number(s.rir) : null,
        setNote: s.setNote || null,
        isTopSet: s.isTopSet, setOrder: idx + 1,
      });

      // Auto-complete target if weight >= targetWeight
      if (block.target && Number(s.weight) >= block.target.targetWeight) {
        try {
          await completeTarget(block.target.id);
          setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, target: null } : b));
        } catch { /* silent */ }
      }

      setBlocks(prev => prev.map(b => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          sets: b.sets.map((set, i) => i === idx ? {
            ...set, logged: true,
            result: { ...resp.loggedSet, strengthGrade: resp.strengthGrade },
            progressionResult: resp.progressionResult,
          } : set),
          alert: resp.progressionAlert,
          exerciseId: resp.loggedSet.exercise.id,
        };
      }));
    } catch { alert('Failed to log set. Check your input values.'); }
  };

  // ─── Summary Screen ─────────────────────────────────────────────────

  if (sessionStep === 'summary') {
    const summaryExercises = blocks.map(block => {
      const topSet = block.sets.find(s => s.logged && s.isTopSet) || block.sets.find(s => s.logged);
      const lastLoggedWithPr = [...block.sets].reverse().find(s => s.logged && s.progressionResult);
      return {
        exerciseName: block.exerciseName,
        exerciseId: block.exerciseId,
        topSetWeight: topSet ? Number(topSet.weight) : null,
        topSetReps: topSet ? Number(topSet.reps) : null,
        progressionResult: lastLoggedWithPr?.progressionResult ?? null,
      };
    }).filter(ex => ex.topSetWeight !== null);

    return (
      <SessionSummary
        sessionId={activeSessionId!}
        sessionDate={sessionDate}
        sessionNotes={sessionNotes}
        existingSessionNote={liveSessionNote}
        exercises={summaryExercises}
        onDone={() => { window.location.href = '/'; }}
      />
    );
  }

  // ─── Session Create Screen ────────────────────────────────────────────

  if (sessionStep === 'create') {
    return (
      <div className="p-5 max-w-lg mx-auto">
        <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            New Session
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Start your workout by creating a session
          </p>
        </div>

        <form onSubmit={handleCreateSession} className="iron-card-static animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animationDelay: '0.1s' }}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Date</label>
            <input type="date" className="iron-input" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Session Notes</label>
            <input type="text" className="iron-input" placeholder="e.g. Push Day, Leg Day..." value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} />
          </div>
          <button type="submit" disabled={sessionCreating} className="iron-btn iron-btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px' }}>
            <Dumbbell size={18} />
            {sessionCreating ? 'Creating...' : 'Start Session'}
          </button>
        </form>
      </div>
    );
  }

  // ─── Logging Screen ───────────────────────────────────────────────────

  return (
    <div className="p-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Log Workout</h1>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {sessionDate} {sessionNotes && `· ${sessionNotes}`}
          </p>
        </div>
        <span style={{
          background: 'rgba(0,245,160,0.12)', color: 'var(--color-accent-neon)',
          padding: '6px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', borderRadius: '6px',
        }}>● Active</span>
      </div>

      {/* SESSION NOTES textarea */}
      <div className="iron-card-static animate-fade-in" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            SESSION NOTES
          </label>
          {noteSaved && (
            <span style={{ fontSize: '11px', color: 'var(--color-accent-neon)', fontFamily: 'var(--font-mono)', transition: 'opacity 0.3s' }}>
              ✓ Saved
            </span>
          )}
        </div>
        <textarea
          className="iron-input"
          style={{ width: '100%', minHeight: '60px', resize: 'vertical', fontSize: '13px', padding: '10px' }}
          placeholder="How's the session going? Any notes..."
          value={liveSessionNote}
          onChange={e => setLiveSessionNote(e.target.value)}
          onBlur={handleSessionNoteBlur}
        />
      </div>

      {/* Exercise Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {blocks.map((block, blockIdx) => (
          <div key={block.id} className="iron-card-static animate-fade-in" style={{ animationDelay: `${blockIdx * 0.05}s` }}>
            {/* Block header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button onClick={() => toggleBlock(block.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px', padding: 0 }}>
                {block.expanded ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                {block.exerciseName}
              </button>
              <button onClick={() => removeBlock(block.id)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={15} />
              </button>
            </div>

            {/* Target Banner */}
            {block.target && (
              <div style={{
                background: 'rgba(0, 245, 160, 0.08)', border: '1px solid rgba(0, 245, 160, 0.25)',
                padding: '10px 14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '13px', fontFamily: 'var(--font-mono)',
              }}>
                <span style={{ color: 'var(--color-accent-neon)' }}>
                  🎯 Target: {block.target.targetWeight}kg
                  {block.target.targetReps && ` × ${block.target.targetReps} reps`}
                </span>
                <button onClick={() => dismissTarget(block.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  ✕ dismiss
                </button>
              </div>
            )}

            {block.alert && <ProgressionBanner alert={block.alert} />}

            {block.expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {block.sets.map((s, idx) => (
                  <div key={idx} style={{
                    borderLeft: s.isTopSet ? '3px solid var(--color-accent-ember)' : `3px solid ${s.logged ? 'var(--color-accent-neon)' : 'transparent'}`,
                    paddingLeft: '14px', transition: 'border-color 0.3s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', width: '50px', flexShrink: 0, letterSpacing: '0.05em' }}>
                        Set {idx + 1}
                      </span>
                      {s.logged && s.result && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={13} style={{ color: 'var(--color-accent-neon)' }} />
                          <GradeBadge grade={s.result.strengthGrade} />
                        </div>
                      )}
                    </div>

                    {s.logged ? (
                      <div>
                        <p className="font-mono" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
                          {s.weight}kg × {s.reps} reps @ RPE {s.rpe}
                          {s.rir && <span style={{ marginLeft: '6px', color: '#888' }}>RIR {s.rir}</span>}
                          {s.isTopSet && <span style={{ marginLeft: '8px', color: 'var(--color-accent-gold)', fontWeight: 700, fontSize: '11px' }}>★ TOP SET</span>}
                        </p>
                        {/* VOLUME FOCUS or e1RM display */}
                        {s.progressionResult && (
                          <span className="font-mono" style={{
                            fontSize: '11px', marginTop: '2px', display: 'inline-block',
                            color: s.progressionResult.isVolumeRange ? 'var(--color-accent-plasma, #E040FB)' : 'var(--color-accent-neon)',
                          }}>
                            {s.progressionResult.isVolumeRange
                              ? 'VOLUME FOCUS'
                              : `Est. Relative Strength: ${s.progressionResult.referenceE1RM}kg`}
                          </span>
                        )}
                        {s.setNote && (
                          <p style={{ fontSize: '11px', color: '#888', marginTop: '4px', fontStyle: 'italic' }}>📝 {s.setNote}</p>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                          <div style={{ flex: 1, minWidth: '70px' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Wt (kg)</label>
                            <input type="number" step="0.5" className="iron-input" style={{ padding: '8px 10px', fontSize: '13px' }} value={s.weight} onChange={e => updateSetField(block.id, idx, 'weight', e.target.value)} placeholder="100" />
                          </div>
                          <div style={{ flex: 1, minWidth: '60px' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Reps</label>
                            <input type="number" className="iron-input" style={{ padding: '8px 10px', fontSize: '13px' }} value={s.reps} onChange={e => updateSetField(block.id, idx, 'reps', e.target.value)} placeholder="5" />
                          </div>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                              <span>RPE</span>
                              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--color-accent-ember)', fontSize: '11px' }}>{s.rpe || '-'}</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input type="range" min="1" max="10" className="iron-input" style={{ padding: '0', height: '38px', cursor: 'pointer' }} value={s.rpe || 5} onChange={e => updateSetField(block.id, idx, 'rpe', e.target.value)} />
                              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px', fontFamily:'Space Grotesk', fontSize:'10px', color:'#555' }}>
                                <span>1<br/>Recovery</span>
                                <span style={{textAlign:'center'}}>5<br/>Moderate</span>
                                <span style={{textAlign:'center'}}>8<br/>Hard</span>
                                <span style={{textAlign:'right'}}>10<br/>Max</span>
                              </div>
                            </div>
                          </div>
                          {/* RIR input */}
                          <div style={{ flex: '0 0 55px' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                              RIR
                            </label>
                            <input type="number" min="0" max="5" className="iron-input" style={{ padding: '8px 6px', fontSize: '13px', textAlign: 'center' }} value={s.rir} onChange={e => updateSetField(block.id, idx, 'rir', e.target.value)} placeholder="-" />
                            <div style={{ fontSize: '8px', color: '#555', marginTop: '2px', textAlign: 'center' }}>Reps left<br/>in tank</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                            <input type="checkbox" checked={s.isTopSet} onChange={e => updateSetField(block.id, idx, 'isTopSet', e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent-ember)' }} />
                            Top Set
                          </label>
                          <button onClick={() => handleLogSet(block.id, idx)} className="iron-btn iron-btn-primary" style={{ padding: '8px 18px', fontSize: '11px' }}>
                            Log
                          </button>
                        </div>
                        {/* Set Note toggle */}
                        <div style={{ width: '100%', marginTop: '4px' }}>
                          {!s.showNote ? (
                            <button onClick={() => updateSetField(block.id, idx, 'showNote', true)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '11px', padding: 0, fontFamily: 'var(--font-mono)' }}>
                              + add note
                            </button>
                          ) : (
                            <input type="text" className="iron-input" style={{ padding: '6px 10px', fontSize: '12px', width: '100%' }}
                              placeholder="Set note..." value={s.setNote}
                              onChange={e => updateSetField(block.id, idx, 'setNote', e.target.value)} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={() => addSet(block.id)} className="iron-btn iron-btn-secondary" style={{ padding: '8px 14px', fontSize: '11px', alignSelf: 'flex-start', marginTop: '4px' }}>
                  <Plus size={13} /> Add Set
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Exercise Panel */}
      <div className="iron-card-static animate-fade-in" style={{ borderStyle: 'dashed' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '16px', letterSpacing: '0.06em' }}>
          + Add Exercise to Session
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            list="exercises-list"
            className="iron-input" 
            style={{ flex: 1, minWidth: '200px', padding: '10px 12px', fontSize: '13px' }} 
            value={pendingExerciseName} 
            onChange={e => setPendingExerciseName(e.target.value)}
            placeholder="Type or select exercise..."
          />
          <datalist id="exercises-list">
            {exercises.map(ex => <option key={ex.id} value={ex.name} />)}
          </datalist>
          <button onClick={addExerciseBlock} disabled={!pendingExerciseName} className="iron-btn iron-btn-primary" style={{ padding: '10px 20px', fontSize: '12px' }}>
            <Plus size={15} /> Add
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button 
          onClick={() => setSessionStep('summary')} 
          className="iron-btn iron-btn-secondary" 
          style={{ width: '100%', padding: '16px', fontSize: '15px' }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
