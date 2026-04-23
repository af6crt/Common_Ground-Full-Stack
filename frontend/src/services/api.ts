import axios from 'axios';
const API_URL = 'http://localhost:3005/api';  // Must match your backend port

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============ AUTH SIGN IN AND SIGN UP ============
export const signup = async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const signin = async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// ============ EVENTS ============
export const getEvents = async () => {
    const response = await api.get('/events');
    return response.data;
};

export const createEvent = async (eventData: any) => {
    const response = await api.post('/events', eventData);
    return response.data;
};

export const updateEvent = async (id: number, eventData: any) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
};

export const deleteEvent = async (id: number) => {
    await api.delete(`/events/${id}`);
};

export const attendEvent = async (id: number) => {
    const response = await api.post(`/events/${id}/attend`);
    return response.data;
};

// ============ MEALS ============
export const getMeals = async () => {
    const response = await api.get('/meals');
    return response.data;
};

export const createMeal = async (mealData: any) => {
    const response = await api.post('/meals', mealData);
    return response.data;
};

export const updateMeal = async (id: number, mealData: any) => {
    const response = await api.put(`/meals/${id}`, mealData);
    return response.data;
};

export const deleteMeal = async (id: number) => {
    await api.delete(`/meals/${id}`);
};

export const requestMeal = async (id: number) => {
    const response = await api.post(`/meals/${id}/request`);
    return response.data;
};

// ============ CLUBS ============
export const getClubs = async () => {
    const response = await api.get('/clubs');
    return response.data;
};

export const joinClub = async (id: number) => {
    const response = await api.post(`/clubs/${id}/join`);
    return response.data;
};

// ============ USER ============
export const getUserProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateUserProfile = async (userData: any) => {
    const response = await api.put('/users/me', userData);
    return response.data;
};

export const changePassword = async (passwordData: any) => {
    const response = await api.put('/users/me/password', passwordData);
    return response.data;
};