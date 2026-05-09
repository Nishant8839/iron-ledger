import type { ProgressionAlert } from '../types';
import { TrendingUp } from 'lucide-react';

export default function ProgressionBanner({ alert }: { alert: ProgressionAlert | null }) {
  if (!alert) return null;

  return (
    <div
      className="rounded-xl p-4 mb-4 animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,159,28,0.08) 100%)',
        border: '1px solid rgba(255,107,53,0.3)',
        boxShadow: '0 0 20px rgba(255,107,53,0.1)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-ember), var(--color-accent-flame))',
          }}
        >
          <TrendingUp size={16} color="#fff" />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-accent-flame)' }}>
            {alert.message}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {alert.exerciseName} · {alert.currentWeight}kg
          </p>
        </div>
      </div>
    </div>
  );
}
