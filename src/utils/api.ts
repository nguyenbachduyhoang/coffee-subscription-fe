import {
  RegisterRequest,
  LoginRequest,
  VerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '../types';
import axios from 'axios';

console.log('API Base URL env:', import.meta.env.VITE_API_BASE_URL);

const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
const DEFAULT_DEV_API = 'http://minhkhoi02-001-site1.anytempurl.com';
// In production (Vercel), use relative base '' so requests hit the same origin
// and are proxied by vercel.json rewrites to the HTTP backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || (isProduction ? '' : DEFAULT_DEV_API);

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.request.use(request => {
  // improve logging to show full request URL
  console.log('Starting Request:', (request.baseURL || '') + (request.url || ''));
  return request;
});

export const getCustomerById = (id: string, token: string) =>
  axiosInstance.get(`/api/customers/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const getMyProfile = (token: string) =>
  axiosInstance.get('/api/customers/my-profile', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const register = async (data: RegisterRequest) => {
  const response = await axiosInstance.post('/api/customers/register', data);
  // return status and data so callers can make robust decisions
  return { status: response.status, data: response.data };
};

export const login = async (data: LoginRequest) => {
  try {
    const response = await axiosInstance.post('/api/customers/login', data);
    console.log('Raw login response:', response);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Login API error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new Error('API endpoint not found. Please check the URL.');
      }
      throw error;
    }
    if (error instanceof Error) {
      console.error('Login API error:', error.message);
    } else {
      console.error('Login API error:', error);
    }
    throw error;
  }
};

// Login with Firebase Google ID token -> backend JWT
export const loginWithGoogle = async (idToken: string) => {
  const response = await axiosInstance.post('/api/customers/login-google', { idToken });
  return response.data;
};

export const verify = (data: VerifyRequest) =>
  axiosInstance.post('/api/customers/verify', data)
    .then(res => res.data);

export const forgotPassword = (data: ForgotPasswordRequest) =>
  axiosInstance.post('/api/customers/forgot-password', data)
    .then(res => res.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  axiosInstance.post('/api/customers/reset-password', data)
    .then(res => res.data);


export const updateProfile = (data: UpdateProfileRequest, token: string) =>
  axiosInstance.post('/api/customers/my-profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
