import type { StrengthGrade } from '../types';

const gradeStyles: Record<StrengthGrade, { bg: string; text: string; glow: string }> = {
  PLATINUM: {
    bg: 'linear-gradient(135deg, #00f5a0, #00d9f5)',
    text: '#08090d',
    glow: '0 0 10px rgba(0, 245, 160, 0.35)',
  },
  GOLD: {
    bg: 'linear-gradient(135deg, #ffd166, #ffab00)',
    text: '#08090d',
    glow: '0 0 10px rgba(255, 209, 102, 0.35)',
  },
  SILVER: {
    bg: 'linear-gradient(135deg, #a0aec0, #718096)',
    text: '#08090d',
    glow: '0 0 10px rgba(160, 174, 192, 0.25)',
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
