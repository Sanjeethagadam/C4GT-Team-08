import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend standard { success, message, data }
    return response.data;
  },
  (error: AxiosError) => {
    // If the error response exists, map it to the backend's standard envelope
    if (error.response) {
      const data = error.response.data as any;
      const standardizedError = {
        success: false,
        message: data?.message || 'An unexpected error occurred.',
        errors: data?.errors || null,
        status: error.response.status,
      };

      if (error.response.status === 401) {
        // Handle unauthorized (e.g., clear token, redirect to login)
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Note: Actual redirection should be handled via router/auth context,
        // but this interceptor clears the local state.
        window.location.href = '/login'; 
      }

      return Promise.reject(standardizedError);
    }
    
    let customMessage = error.message || 'Network error.';
    if (customMessage.includes('timeout')) {
      customMessage = 'Request timed out. Please try again.';
    }
    
    // Network or other errors
    return Promise.reject({
      success: false,
      message: customMessage,
      errors: null,
      status: 500,
    });
  }
);
