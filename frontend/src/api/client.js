import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

let refreshing = false;
let waitingQueue = [];

function resolveQueue(token) {
  waitingQueue.forEach((cb) => cb(token));
  waitingQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const unauthorized = error?.response?.status === 401;
    const refreshToken = localStorage.getItem('refreshToken');

    if (!unauthorized || !refreshToken || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve) => {
        waitingQueue.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    refreshing = true;

    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      resolveQueue(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
