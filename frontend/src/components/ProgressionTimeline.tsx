import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getProgressionTimeline } from '../api/dashboardApi';
import type { Exercise } from '../components/PowerChart';

interface ProgressionTimelineEvent {
  date: string;
  weight: number;
  reps: number;
  estimated1Rm: number;
}

interface ProgressionTimelineProps {
  exercises: Exercise[];
  selectedExerciseId: number | '';
  onExerciseChange: (id: number) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(74, 74, 74, 0.12)',
        borderRadius: '10px',
        padding: '12px',
        fontFamily: 'var(--font-mono)',
        boxShadow: '0 8px 32px rgba(143, 128, 115, 0.12)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color, margin: '4px 0', fontSize: '13px' }}>
            <span style={{ display: 'inline-block', width: '120px' }}>{entry.name}:</span>
            <span style={{ fontWeight: 'bold' }}>{entry.value}</span>
            {entry.name === 'Weight' && entry.payload.reps && (
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px' }}>(x{entry.payload.reps})</span>
            )}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressionTimeline({ exercises, selectedExerciseId, onExerciseChange }: ProgressionTimelineProps) {
  const [data, setData] = useState<ProgressionTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedExerciseId) {
      setLoading(true);
      getProgressionTimeline(Number(selectedExerciseId))
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setData([]);
    }
  }, [selectedExerciseId]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontSize: '18px' }}>
          Est. Relative Strength Progression
        </h3>
        <select 
          className="iron-input" 
          style={{ width: '250px' }} 
          value={selectedExerciseId} 
          onChange={e => onExerciseChange(Number(e.target.value))}
        >
          <option value="" disabled>Select exercise...</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div style={{ width: '100%', height: '400px', minHeight: '400px', marginTop: '16px' }}>
        {loading ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : data.length === 0 ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>No data available for this exercise.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,74,74,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#8F8073', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={{ stroke: 'rgba(74,74,74,0.1)' }} />
              <YAxis tick={{ fill: '#8F8073', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px', paddingTop: '10px' }} />
              
              <Line 
                type="monotone" 
                dataKey="estimated1Rm" 
                name="Est. Relative Strength" 
                stroke="#7A9A6D" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#F5F2EB', stroke: '#7A9A6D', strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: '#7A9A6D', stroke: '#fff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                name="Weight" 
                stroke="#C08552" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#F5F2EB', stroke: '#C08552', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
