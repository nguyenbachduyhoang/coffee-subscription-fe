
import {
  RegisterRequest,
  LoginRequest,
  VerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '../types';

const BASE_URL = 'http://minhkhoi-001-site1.qtempurl.com';

export const getCustomerById = (id: string, token: string) =>
  fetch(`${BASE_URL}/api/Customer/get-customer-by-id/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json());

export const getMyProfile = (token: string) =>
  fetch(`${BASE_URL}/api/Customer/my-profile`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json());


export const register = (data: RegisterRequest) =>
  fetch(`${BASE_URL}/api/Customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());


export const login = (data: LoginRequest) =>
  fetch(`${BASE_URL}/api/Customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.text());


export const verify = (data: VerifyRequest) =>
  fetch(`${BASE_URL}/api/Customer/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());


export const forgotPassword = (data: ForgotPasswordRequest) =>
  fetch(`${BASE_URL}/api/Customer/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());


export const resetPassword = (data: ResetPasswordRequest) =>
  fetch(`${BASE_URL}/api/Customer/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());


export const updateProfile = (data: UpdateProfileRequest, token: string) =>
  fetch(`${BASE_URL}/api/Customer/update-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then(res => res.json());
