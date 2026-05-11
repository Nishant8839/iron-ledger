import axios from 'axios';
import type { Exercise, WorkoutSession, SetLogRequest, SetResponseDTO, LoggedSet, NextSessionTarget } from '../types';

export const API = axios.create({
  baseURL: 'https://iron-ledger-twy4.onrender.com/api',
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('iron_ledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('iron_ledger_token');
      localStorage.removeItem('iron_ledger_username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getExercises = () => API.get<Exercise[]>('/exercises').then(r => r.data);
export const createExercise = (ex: Partial<Exercise>) => API.post<Exercise>('/exercises', ex).then(r => r.data);

export const getSessions = () => API.get<WorkoutSession[]>('/sessions').then(r => r.data);
export const createSession = (session: Partial<WorkoutSession>) => API.post<WorkoutSession>('/sessions', session).then(r => r.data);
export const patchSession = (id: number, data: Record<string, unknown>) => API.put<void>(`/sessions/${id}`, data);

export const getSetsForSession = (sessionId: number) => API.get<LoggedSet[]>(`/sets/session/${sessionId}`).then(r => r.data);
export const logSet = (request: SetLogRequest) => API.post<SetResponseDTO>('/sets', request).then(r => r.data);
export const updateSet = (setId: number, request: SetLogRequest) => API.put<SetResponseDTO>(`/sets/${setId}`, request).then(r => r.data);

export const getTargets = (exerciseId: number, status: string = 'PENDING') =>
  API.get<NextSessionTarget[]>(`/targets?exerciseId=${exerciseId}&status=${status}`).then(r => r.data);
export const completeTarget = (id: number) => API.patch<NextSessionTarget>(`/targets/${id}/complete`).then(r => r.data);
export const skipTarget = (id: number) => API.patch<NextSessionTarget>(`/targets/${id}/skip`).then(r => r.data);
export const createTarget = (data: { exerciseId: number; targetWeight: number; targetReps?: number; createdFromSessionId?: number }) =>
  API.post<NextSessionTarget>('/targets', data).then(r => r.data);