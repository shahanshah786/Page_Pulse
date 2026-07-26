import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});


export async function runAudit(url) {
  try {
    const { data } = await apiClient.post('/audit', { url });
    return data;
  } catch (err) {
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: err.message === 'Network Error'
        ? 'Could not reach the Page Pulse API. Is the server running?'
        : 'Something went wrong. Please try again.',
      errorCode: 'CLIENT_ERROR',
      requestId: null,
    };
  }
}

export async function getHealth() {
  const { data } = await apiClient.get('/health');
  return data;
}
