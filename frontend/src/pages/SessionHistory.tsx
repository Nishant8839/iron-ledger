import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { getFilteredSessions, deleteSession, updateSession } from '../api/sessionHistoryApi';
import type { SessionFilters, UpdateSessionRequestDTO } from '../api/sessionHistoryApi';
import { getExerciseList } from '../api/dashboardApi';
import SessionFilterBar from '../components/SessionFilterBar';
import SessionAccordionCard from '../components/SessionAccordionCard';
import SessionEditModal from '../components/SessionEditModal';
import type { Exercise } from '../types';

export default function SessionHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SessionFilters>({});

  useEffect(() => {
    getExerciseList().then(setExercises).catch(console.error);
    fetchSessions({});
  }, []);

  const fetchSessions = (filters: SessionFilters) => {
    setCurrentFilters(filters);
    getFilteredSessions(filters).then(setSessions).catch(console.error);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete session');
    }
  };

  const handleUpdate = async (id: number, payload: UpdateSessionRequestDTO) => {
    await updateSession(id, payload);
    fetchSessions(currentFilters); // Refresh the list
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Session History
        </h1>
        <button
          onClick={() => window.open('https://iron-ledger-twy4.onrender.com/api/export/csv', '_blank')}
          className="iron-btn iron-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <SessionFilterBar exercises={exercises} onFilterChange={fetchSessions} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sessions.map(session => (
          <SessionAccordionCard
            key={session.id}
            session={session}
            onDelete={handleDelete}
            onEdit={(s) => setEditingSession(s)}
          />
        ))}
        {sessions.length === 0 && (
          <div style={{ color: '#555', fontFamily: 'var(--font-display)' }}>No sessions match the filters.</div>
        )}
      </div>

      {editingSession && (
        <SessionEditModal
          session={editingSession}
          exercises={exercises}
          onClose={() => setEditingSession(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
