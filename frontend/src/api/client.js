import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vulnerax_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vulnerax_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    console.error('[VulneraX API]', message);
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  return client.post('/auth/login', { username, password });
};

export const register = async (username, email, password) => {
  return client.post('/auth/register', { username, email, password });
};

export const forgotPassword = async (email) => {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, new_password) => {
  const response = await client.post('/auth/reset-password', { token, new_password });
  return response.data;
};

export const updatePassword = async (current_password, new_password) => {
  const response = await client.post('/auth/update-password', { current_password, new_password });
  return response.data;
};

export const getMe = async () => {
  return client.get('/auth/me');
};

export const startScan = async (target, headers = null, cookies = null) => {
  return client.post('/scan', { target, headers, cookies });
};

export const getScanStatus = async (scanId) => {
  return client.get(`/scan/${scanId}/status`);
};

export const getScanResults = async (scanId) => {
  return client.get(`/scan/${scanId}/results`);
};

export const getScanHistory = async () => {
  return client.get('/history');
};

export const deleteScan = async (scanId) => {
  return client.delete(`/scan/${scanId}`);
};

export const abortScan = async (scanId) => {
  return client.post(`/scan/${scanId}/abort`);
};

export const getReport = async (scanId, format) => {
  return client.get(`/report/${scanId}?format=${format}`, {
    responseType: format === 'json' ? 'json' : 'blob',
  });
};

export const generateAIRemediation = async (scanId, title, description, evidence) => {
  return client.post(`/scan/${scanId}/remediation/ai`, {
    vulnerability_title: title,
    vulnerability_description: description,
    evidence: evidence
  });
};

export default client;
