import { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import type { UpdateSessionRequestDTO } from '../api/sessionHistoryApi';
import type { Exercise } from '../types';

interface SessionEditModalProps {
  session: any; // SessionWithSetsDTO
  exercises: Exercise[];
  onClose: () => void;
  onSave: (id: number, payload: UpdateSessionRequestDTO) => Promise<void>;
}

// Flat set format for editing
interface EditSet {
  uid: string;
  exerciseName: string;
  weight: string;
  reps: string;
  rpe: string;
  isTopSet: boolean;
}

export default function SessionEditModal({ session, exercises, onClose, onSave }: SessionEditModalProps) {
  const [date, setDate] = useState(session.date || '');
  const [notes, setNotes] = useState(session.sessionNotes || '');
  const [sets, setSets] = useState<EditSet[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Flatten session blocks into a single array of sets
    const flatSets: EditSet[] = [];
    if (session.exercises) {
      session.exercises.forEach((block: any) => {
        if (block.sets) {
          block.sets.forEach((s: any) => {
            flatSets.push({
              uid: crypto.randomUUID(),
              exerciseName: block.exerciseName || s.exercise?.name || '',
              weight: String(s.weight),
              reps: String(s.reps),
              rpe: String(s.rpe),
              isTopSet: s.isTopSet || s.topSet || false,
            });
          });
        }
      });
    }
    setSets(flatSets);
  }, [session, exercises]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateSessionRequestDTO = {
        date,
        sessionNotes: notes,
        sets: sets.map((s, idx) => ({
          exerciseName: s.exerciseName,
          weight: Number(s.weight),
          reps: Number(s.reps),
          rpe: Number(s.rpe),
          isTopSet: s.isTopSet,
          setOrder: idx + 1
        }))
      };
      await onSave(session.id, payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save session');
      setSaving(false);
    }
  };

  const addSet = () => {
    // Copy exerciseName from previous set if possible
    const lastExName = sets.length > 0 ? sets[sets.length - 1].exerciseName : '';
    setSets([...sets, { uid: crypto.randomUUID(), exerciseName: lastExName, weight: '', reps: '', rpe: '5', isTopSet: false }]);
  };

  const removeSet = (uid: string) => {
    setSets(sets.filter(s => s.uid !== uid));
  };

  const updateSet = (uid: string, field: keyof EditSet, value: any) => {
    setSets(prev => prev.map(s => {
      if (s.uid !== uid) return s;
      return { ...s, [field]: value };
    }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999,
      padding: '20px', fontFamily: 'var(--font-sans)'
    }}>
      <div className="iron-card-static" style={{ 
        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, textTransform: 'uppercase' }}>Edit Session</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Date</label>
              <input type="date" className="iron-input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Session Notes</label>
              <input type="text" className="iron-input" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Logged Sets</label>
              <button type="button" onClick={addSet} className="iron-btn iron-btn-secondary" style={{ padding: '4px 12px', fontSize: '11px' }}>
                <Plus size={14} /> Add Set
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sets.map((s, idx) => (
                <div key={s.uid} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#555', fontFamily: 'var(--font-mono)' }}>Set {idx + 1}</span>
                    <button type="button" onClick={() => removeSet(s.uid)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div style={{ flex: 2, minWidth: '150px' }}>
                    <input 
                      type="text" 
                      list="edit-exercises-list"
                      className="iron-input" 
                      style={{ padding: '8px', fontSize: '12px' }} 
                      value={s.exerciseName} 
                      onChange={e => updateSet(s.uid, 'exerciseName', e.target.value)} 
                      placeholder="Type exercise name..." 
                      required 
                    />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '60px' }}>
                    <input type="number" step="0.5" className="iron-input" style={{ padding: '8px', fontSize: '12px' }} placeholder="kg" value={s.weight} onChange={e => updateSet(s.uid, 'weight', e.target.value)} required />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '60px' }}>
                    <input type="number" className="iron-input" style={{ padding: '8px', fontSize: '12px' }} placeholder="reps" value={s.reps} onChange={e => updateSet(s.uid, 'reps', e.target.value)} required />
                  </div>

                  <div style={{ flex: 1, minWidth: '60px' }}>
                    <input type="number" className="iron-input" style={{ padding: '8px', fontSize: '12px' }} placeholder="RPE" min="1" max="10" value={s.rpe} onChange={e => updateSet(s.uid, 'rpe', e.target.value)} required />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', height: '36px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: s.isTopSet ? 'var(--color-accent-gold)' : '#888' }}>
                      <input type="checkbox" checked={s.isTopSet} onChange={e => updateSet(s.uid, 'isTopSet', e.target.checked)} style={{ accentColor: 'var(--color-accent-gold)' }} />
                      Top Set
                    </label>
                  </div>
                </div>
              ))}
              {sets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#555', fontSize: '12px' }}>No sets. Add one to keep the session.</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="iron-btn iron-btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
            <button type="submit" disabled={saving} className="iron-btn iron-btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <datalist id="edit-exercises-list">
            {exercises.map(ex => <option key={ex.id} value={ex.name} />)}
          </datalist>
        </form>
      </div>
    </div>
  );
}
