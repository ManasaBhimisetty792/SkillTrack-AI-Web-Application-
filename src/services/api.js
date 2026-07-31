/**
 * Central Axios instance.
 * - Attaches the access token to every request.
 * - On a 401, tries once to refresh the token and replay the request.
 * - If refresh also fails, clears storage and lets the caller redirect to /login.
 */
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const STORAGE_KEYS = {
  access: 'st_access_token',
  refresh: 'st_refresh_token',
  user: 'st_user',
};

export const tokenStorage = {
  get access() {
    return localStorage.getItem(STORAGE_KEYS.access);
  },
  get refresh() {
    return localStorage.getItem(STORAGE_KEYS.refresh);
  },
  get user() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to parse st_user from localStorage:', e);
      return null;
    }
  },
  set({ access, refresh, user }) {
    if (access) localStorage.setItem(STORAGE_KEYS.access, access);
    if (refresh) localStorage.setItem(STORAGE_KEYS.refresh, refresh);
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.access);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes('/login') || originalRequest?.url?.includes('/signup');

    if (status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.refresh;
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/refresh-token`, { refresh_token: refreshToken });
      tokenStorage.set({
        access: data.tokens.access_token,
        refresh: data.tokens.refresh_token,
        user: data.user,
      });

      resolveQueue(null, data.tokens.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.tokens.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      tokenStorage.clear();
      window.dispatchEvent(new Event('st-auth-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
