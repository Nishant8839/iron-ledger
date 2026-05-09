import { API } from './api';

export const getTopSetsByExercise = async (exerciseId: number, days: number = 30) => {
    const res = await API.get(`/sessions/top-sets?exerciseId=${exerciseId}&days=${days}`);
    return res.data;
};

export const getSessionTonnageTrend = async (days: number = 30) => {
    const res = await API.get(`/sessions/tonnage-trend?days=${days}`);
    return res.data;
};

export const getProgressionTimeline = async (exerciseId: number) => {
    const res = await API.get(`/sessions/progression-timeline?exerciseId=${exerciseId}`);
    return res.data;
};

export const getExerciseList = async () => {
    const res = await API.get('/exercises');
    return res.data;
};

export const getDashboardStats = async () => {
    const res = await API.get('/sessions/stats');
    return res.data;
};

export const getRecentSessions = async (limit: number = 5) => {
    const res = await API.get(`/sessions/recent?limit=${limit}`);
    return res.data;
};
