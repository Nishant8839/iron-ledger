import { API } from './api';

export interface SessionFilters {
  exercise?: string;
  from?: string;
  to?: string;
  topGrade?: string;
}

export const getAllSessions = async () => {
    const res = await API.get('/sessions');
    return res.data;
};

export const getFilteredSessions = async (filters: SessionFilters) => {
    const params = new URLSearchParams();
    if (filters.exercise) params.append('exercise', filters.exercise);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.topGrade) params.append('topGrade', filters.topGrade);

    const res = await API.get(`/sessions?${params.toString()}`);
    return res.data;
};

export const deleteSession = async (id: number) => {
    await API.delete(`/sessions/${id}`);
};

export interface UpdateSetRequestDTO {
    exerciseId?: number;
    exerciseName?: string;
    weight: number;
    reps: number;
    rpe?: number | null;
    isTopSet: boolean;
    setOrder: number;
}

export interface UpdateSessionRequestDTO {
    date: string;
    sessionNotes: string;
    sets: UpdateSetRequestDTO[];
}

export const updateSession = async (id: number, payload: UpdateSessionRequestDTO) => {
    await API.put(`/sessions/${id}`, payload);
};


