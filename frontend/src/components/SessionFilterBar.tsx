import { useState } from 'react';
import type { SessionFilters } from '../api/sessionHistoryApi';
import type { Exercise } from '../types';

interface SessionFilterBarProps {
  exercises: Exercise[];
  onFilterChange: (filters: SessionFilters) => void;
}

export default function SessionFilterBar({ exercises, onFilterChange }: SessionFilterBarProps) {
  const [exercise, setExercise] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [topGrade, setTopGrade] = useState('ALL');

  const handleApply = () => {
    onFilterChange({ exercise, from, to, topGrade });
  };

  const handleClear = () => {
    setExercise('');
    setFrom('');
    setTo('');
    setTopGrade('ALL');
    onFilterChange({ exercise: '', from: '', to: '', topGrade: 'ALL' });
  };

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 150px' }}>
        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Exercise</label>
        <select className="iron-input" style={{ width: '100%', padding: '8px' }} value={exercise} onChange={e => setExercise(e.target.value)}>
          <option value="">All Exercises</option>
          {exercises.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
        </select>
      </div>

      <div style={{ flex: '1 1 130px' }}>
        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>From Date</label>
        <input type="date" className="iron-input" style={{ width: '100%', padding: '8px' }} value={from} onChange={e => setFrom(e.target.value)} />
      </div>

      <div style={{ flex: '1 1 130px' }}>
        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>To Date</label>
        <input type="date" className="iron-input" style={{ width: '100%', padding: '8px' }} value={to} onChange={e => setTo(e.target.value)} />
      </div>

      <div style={{ flex: '1 1 120px' }}>
        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Top Grade</label>
        <select className="iron-input" style={{ width: '100%', padding: '8px' }} value={topGrade} onChange={e => setTopGrade(e.target.value)}>
          <option value="ALL">All Grades</option>
          <option value="PLATINUM">Platinum</option>
          <option value="GOLD">Gold</option>
          <option value="SILVER">Silver</option>
          <option value="BASELINE">Baseline</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', flex: '1 1 200px' }}>
        <button onClick={handleApply} className="iron-btn iron-btn-primary" style={{ flex: 1, padding: '8px' }}>Apply</button>
        <button onClick={handleClear} className="iron-btn iron-btn-secondary" style={{ flex: 1, padding: '8px' }}>Clear</button>
      </div>
    </div>
  );
}
