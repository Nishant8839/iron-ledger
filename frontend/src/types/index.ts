export interface Exercise {
  id: number;
  name: string;
  category: string;
  isCustom: boolean;
  notes: string;
}

export interface WorkoutSession {
  id: number;
  date: string;
  sessionNotes: string;
  sessionNote: string;
}

export type StrengthGrade = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BASELINE';

export interface LoggedSet {
  id: number;
  exercise: Exercise;
  workoutSession: WorkoutSession;
  weight: number;
  reps: number;
  rpe: number;
  rir: number | null;
  setNote: string | null;
  isTopSet: boolean;
  strengthGrade: StrengthGrade;
  setOrder: number;
}

export interface ProgressionAlert {
  message: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeightKg: number;
  suggestedWeightLbs: number;
}

export interface ProgressionResult {
  referenceE1RM: number | null;
  previousE1RM: number | null;
  percentageChange: number | null;
  trendDirection: string;
  isVolumeRange: boolean;
}

export interface SetResponseDTO {
  loggedSet: LoggedSet;
  strengthGrade: StrengthGrade;
  progressionAlert: ProgressionAlert | null;
  progressionResult: ProgressionResult | null;
}

export interface SetLogRequest {
  exerciseId?: number;
  exerciseName?: string;
  sessionId: number;
  weight: number;
  reps: number;
  rpe: number;
  rir?: number | null;
  setNote?: string | null;
  isTopSet: boolean;
  setOrder: number;
}

export interface NextSessionTarget {
  id: number;
  exercise: Exercise;
  targetWeight: number;
  targetReps: number | null;
  createdFromSessionId: number | null;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  createdDate: string;
}
