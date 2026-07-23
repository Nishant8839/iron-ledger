import type { StrengthGrade } from '../types';

const gradeStyles: Record<StrengthGrade, { bg: string; text: string; glow: string }> = {
  PLATINUM: {
    bg: 'linear-gradient(135deg, #7A9A6D, #9DB88F)',
    text: '#fff',
    glow: '0 0 10px rgba(122, 154, 109, 0.25)',
  },
  GOLD: {
    bg: 'linear-gradient(135deg, #C08552, #DAB49D)',
    text: '#fff',
    glow: '0 0 10px rgba(192, 133, 82, 0.25)',
  },
  SILVER: {
    bg: 'linear-gradient(135deg, #8F8073, #B0A89F)',
    text: '#fff',
    glow: '0 0 10px rgba(143, 128, 115, 0.2)',
  },
  BASELINE: {
    bg: 'var(--color-surface-raised)',
    text: 'var(--color-text-secondary)',
    glow: 'none',
  },
};

export default function GradeBadge({ grade, className }: { grade: StrengthGrade; className?: string }) {
  const style = gradeStyles[grade as StrengthGrade] || gradeStyles['BASELINE'];

  return (
    <span
      className={`grade-badge ${className || ''}`}
      style={{
        background: style.bg,
        color: style.text,
        boxShadow: style.glow,
        border: grade === 'BASELINE' ? '1px solid var(--color-border)' : 'none',
      }}
    >
      {grade}
    </span>
  );
}
