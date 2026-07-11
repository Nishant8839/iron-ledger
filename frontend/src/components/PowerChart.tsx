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
          backgroundColor: '#12141c',
          border: '1px solid rgba(224, 64, 251, 0.5)',
          padding: '10px',
          fontFamily: 'var(--font-mono)',
          maxWidth: '220px',
        }}>
          <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '11px' }}>{label}</p>
          <p style={{ color: '#E040FB', margin: '2px 0', fontSize: '12px' }}>
            Volume session — reps &gt; 10, est. strength not calculated
          </p>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#12141c',
        border: '1px solid var(--color-accent-ember)',
        padding: '10px',
        fontFamily: 'var(--font-mono)'
      }}>
        <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '11px' }}>{label}</p>
        <p style={{ color: entry.fill || '#FF6B00', margin: '2px 0', fontSize: '13px' }}>
          Est. Relative Strength: {data?.weight}kg
          {data?.grade && (
            <span style={{ marginLeft: '8px', padding: '2px 4px', fontSize: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: data.grade === 'PLATINUM' ? '#39FF14' : '#fff' }}>
              {data.grade}
            </span>
          )}
        </p>
        {data?.rpe != null && (
          <p style={{ color: '#888', margin: '2px 0', fontSize: '11px' }}>RPE: {data.rpe}</p>
        )}
        {data?.rir != null && (
          <p style={{ color: '#888', margin: '2px 0', fontSize: '11px' }}>RIR: {data.rir}</p>
        )}
        {data?.setNote && (
          <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '11px', fontStyle: 'italic' }}>📝 {data.setNote}</p>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={{ stroke: '#1e2030' }} />
            <YAxis 
              tick={{ fill: '#555', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
              tickLine={false} 
              axisLine={false}
              label={{ value: 'Est. Relative Strength (kg)', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 11, fontFamily: 'JetBrains Mono', dx: 15 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#1e2030" />
            
            <Bar dataKey="weight" name="Est. Relative Strength" fill="#FF6B00" maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isVolumeRange ? 'transparent' : '#FF6B00'} 
                  stroke={entry.isVolumeRange ? '#E040FB' : 'none'}
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
