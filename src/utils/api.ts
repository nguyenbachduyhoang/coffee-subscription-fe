import {
  RegisterRequest,
  LoginRequest,
  VerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '../types';
import axios from 'axios';

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://minhkhoi02-001-site1.anytempurl.com';

const axiosInstance = axios.create({
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
  axiosInstance.get(`/api/Customer/get-customer-by-id/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const getMyProfile = (token: string) =>
  axiosInstance.get('/api/Customer/my-profile', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const register = async (data: RegisterRequest) => {
  const response = await axiosInstance.post('/api/Customer/register', data);
  // return status and data so callers can make robust decisions
  return { status: response.status, data: response.data };
};

export const login = async (data: LoginRequest) => {
  try {
    const response = await axiosInstance.post('/api/Customer/login', data);
    console.log('Raw login response:', response);
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const verify = (data: VerifyRequest) =>
  axiosInstance.post('/api/Customer/verify', data)
    .then(res => res.data);

export const forgotPassword = (data: ForgotPasswordRequest) =>
  axiosInstance.post('/api/Customer/forgot-password', data)
    .then(res => res.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  axiosInstance.post('/api/Customer/reset-password', data)
    .then(res => res.data);


export const updateProfile = (data: UpdateProfileRequest, token: string) =>
  axiosInstance.post('/api/Customer/update-profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
