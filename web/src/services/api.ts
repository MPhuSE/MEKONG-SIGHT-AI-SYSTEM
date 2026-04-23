import axios from 'axios';

const env = import.meta.env;
const browserOrigin =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}`
    : 'http://localhost';

const SERVICES = {
  AUTH: env.VITE_AUTH_API_URL || 'http://localhost:3000/api',
  FARM: env.VITE_FARM_API_URL || 'http://localhost:3001/api',
  IOT: env.VITE_IOT_API_URL || 'http://localhost:3002/api',
  AI: env.VITE_AI_API_URL || 'http://localhost:8000/api',
};

const AI_GATEWAY_FALLBACK = env.VITE_AI_GATEWAY_URL || `${browserOrigin}/api`;

const api = axios.create({
  baseURL: SERVICES.AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (config.url?.startsWith('/farms')) {
    config.baseURL = SERVICES.FARM;
  } else if (config.url?.startsWith('/iot')) {
    config.baseURL = SERVICES.IOT;
  } else if (config.url?.startsWith('/ai')) {
    config.baseURL = SERVICES.AI;
  } else {
    config.baseURL = SERVICES.AUTH;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as any;
    const isAiRequest = typeof config?.url === 'string' && config.url.startsWith('/ai');
    const isNetworkError = !error?.response;

    if (isAiRequest && isNetworkError && !config?._aiGatewayRetried) {
      return api.request({
        ...config,
        baseURL: AI_GATEWAY_FALLBACK,
        _aiGatewayRetried: true,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
