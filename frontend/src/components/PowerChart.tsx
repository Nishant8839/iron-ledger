import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export interface TopSetData {
  date: string;
  weight: number;
  grade: string;
  isVolumeRange?: boolean;
  rpe?: number;
  rir?: number | null;
  setNote?: string | null;
}

export interface Exercise {
  id: number;
  name: string;
}

interface PowerChartProps {
  topSets: TopSetData[];
  exercises: Exercise[];
  selectedExerciseId: number | '';
  onExerciseChange: (id: number) => void;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const data = entry?.payload;

    if (data?.isVolumeRange) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(143, 128, 115, 0.3)',
          padding: '10px',
          fontFamily: 'var(--font-mono)',
          maxWidth: '220px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(143, 128, 115, 0.1)',
        }}>
          <p style={{ margin: '0 0 5px 0', color: 'var(--color-text-muted)', fontSize: '11px' }}>{label}</p>
          <p style={{ color: '#8F8073', margin: '2px 0', fontSize: '12px' }}>
            Volume session — reps &gt; 10, est. strength not calculated
          </p>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid var(--color-accent-ember)',
        padding: '10px',
        fontFamily: 'var(--font-mono)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(192, 133, 82, 0.15)',
      }}>
        <p style={{ margin: '0 0 5px 0', color: 'var(--color-text-muted)', fontSize: '11px' }}>{label}</p>
        <p style={{ color: entry.fill || '#C08552', margin: '2px 0', fontSize: '13px' }}>
          Est. Relative Strength: {data?.weight}kg
          {data?.grade && (
            <span style={{ marginLeft: '8px', padding: '2px 4px', fontSize: '10px', borderRadius: '4px', background: 'rgba(74,74,74,0.08)', color: data.grade === 'PLATINUM' ? '#7A9A6D' : 'var(--color-text-primary)' }}>
              {data.grade}
            </span>
          )}
        </p>
        {data?.rpe != null && (
          <p style={{ color: 'var(--color-text-muted)', margin: '2px 0', fontSize: '11px' }}>RPE: {data.rpe}</p>
        )}
        {data?.rir != null && (
          <p style={{ color: 'var(--color-text-muted)', margin: '2px 0', fontSize: '11px' }}>RIR: {data.rir}</p>
        )}
        {data?.setNote && (
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0 0', fontSize: '11px', fontStyle: 'italic' }}>📝 {data.setNote}</p>
        )}
      </div>
    );
  }
  return null;
};

export default function PowerChart({ topSets, exercises, selectedExerciseId, onExerciseChange }: PowerChartProps) {
  
  const data = topSets
    .map(ts => ({
      date: ts.date,
      weight: ts.isVolumeRange ? 0 : ts.weight,
      grade: ts.grade,
      isVolumeRange: ts.isVolumeRange || false,
      rpe: ts.rpe,
      rir: ts.rir,
      setNote: ts.setNote,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      <select 
        className="iron-input" 
        style={{ maxWidth: '250px' }} 
        value={selectedExerciseId} 
        onChange={e => onExerciseChange(Number(e.target.value))}
      >
        <option value="" disabled>Select exercise...</option>
        {exercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>

      <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 74, 74, 0.08)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#8F8073', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={{ stroke: 'rgba(74, 74, 74, 0.1)' }} />
            <YAxis 
              tick={{ fill: '#8F8073', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
              tickLine={false} 
              axisLine={false}
              label={{ value: 'Est. Relative Strength (kg)', angle: -90, position: 'insideLeft', fill: '#8F8073', fontSize: 11, fontFamily: 'JetBrains Mono', dx: 15 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(74, 74, 74, 0.1)" />
            
            <Bar dataKey="weight" name="Est. Relative Strength" fill="#C08552" maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isVolumeRange ? 'transparent' : '#C08552'} 
                  stroke={entry.isVolumeRange ? '#8F8073' : 'none'}
                  strokeWidth={entry.isVolumeRange ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
