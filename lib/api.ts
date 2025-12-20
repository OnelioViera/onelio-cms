// lib/api.ts
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from './store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let apiClient: AxiosInstance;

export const initializeApiClient = () => {
  apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle response errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

export const getApiClient = () => {
  if (!apiClient) {
    initializeApiClient();
  }
  return apiClient;
};

// Auth API calls
export const authAPI = {
  register: (email: string, password: string, name: string, tenantSlug: string) =>
    getApiClient().post('/auth/register', { email, password, name, tenantSlug }),
  
  login: (email: string, password: string) =>
    getApiClient().post('/auth/login', { email, password }),
  
  getCurrentUser: () =>
    getApiClient().get('/auth/me'),
};

// Tenant API calls
export const tenantAPI = {
  getTenant: () =>
    getApiClient().get('/tenants'),
};

// Schema API calls
export const schemaAPI = {
  listSchemas: (tenantId: string) =>
    getApiClient().get(`/schemas/${tenantId}`),
  
  getSchema: (tenantId: string, slug: string) =>
    getApiClient().get(`/schemas/${tenantId}/${slug}`),
  
  createSchema: (tenantId: string, data: any) =>
    getApiClient().post(`/schemas/${tenantId}`, data),
  
  updateSchema: (tenantId: string, contentTypeId: string, data: any) =>
    getApiClient().patch(`/schemas/${tenantId}/${contentTypeId}`, data),
  
  deleteSchema: (tenantId: string, contentTypeId: string) =>
    getApiClient().delete(`/schemas/${tenantId}/${contentTypeId}`),
};

// Content API calls
export const contentAPI = {
  listContent: (tenantId: string, contentTypeSlug: string, isDraft?: boolean) =>
    getApiClient().get(`/content/${tenantId}/${contentTypeSlug}`, {
      params: { isDraft },
    }),
  
  getContent: (tenantId: string, contentTypeSlug: string, contentId: string) =>
    getApiClient().get(`/content/${tenantId}/${contentTypeSlug}/${contentId}`),
  
  createContent: (tenantId: string, contentTypeSlug: string, data: any) =>
    getApiClient().post(`/content/${tenantId}/${contentTypeSlug}`, data),
  
  updateContent: (tenantId: string, contentTypeSlug: string, contentId: string, data: any) =>
    getApiClient().patch(`/content/${tenantId}/${contentTypeSlug}/${contentId}`, data),
  
  publishContent: (tenantId: string, contentTypeSlug: string, contentId: string) =>
    getApiClient().post(`/content/${tenantId}/${contentTypeSlug}/${contentId}/publish`, {}),
  
  deleteContent: (tenantId: string, contentTypeSlug: string, contentId: string) =>
    getApiClient().delete(`/content/${tenantId}/${contentTypeSlug}/${contentId}`),
};

// User API calls
export const userAPI = {
  listUsers: (tenantId: string) =>
    getApiClient().get(`/users/${tenantId}`),
  
  getUser: (tenantId: string, userId: string) =>
    getApiClient().get(`/users/${tenantId}/${userId}`),
  
  createUser: (tenantId: string, data: any) =>
    getApiClient().post(`/users/${tenantId}`, data),
  
  updateUser: (tenantId: string, userId: string, data: any) =>
    getApiClient().patch(`/users/${tenantId}/${userId}`, data),
  
  deleteUser: (tenantId: string, userId: string) =>
    getApiClient().delete(`/users/${tenantId}/${userId}`),
};

