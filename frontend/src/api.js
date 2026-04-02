import axios from 'axios';

const api = axios.create({
  // Prefer explicit BASE_URL, but keep backward compatibility with older key.
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api',
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired / invalid token)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // Hard redirect — clears all React state and forces re-login
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
