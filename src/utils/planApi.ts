import { AxiosError } from 'axios';
import { axiosInstance } from './api';
import { Package } from '../types';

// API Response interfaces
interface PlanApiResponse {
  planId: number;
  name: string;
  description: string;
  productName: string;
  imageUrl: string;
  price: number;
  durationDays: number;
  dailyQuota: number;
  maxPerVisit: number;
  active: boolean;
}

// Base URL is managed centrally in axiosInstance (utils/api.ts)

// Ensure images use HTTPS to avoid mixed-content in production
const ensureHttps = (url?: string): string | undefined => {
  if (!url) return url;
  return url.replace(/^http:\/\//i, 'https://');
};

// Use shared axiosInstance but keep possibility to override baseURL in dev
const planApiInstance = axiosInstance;

// Add request interceptor for debugging
planApiInstance.interceptors.request.use(request => {
  console.log('Plan API Request:', (request.baseURL || '') + (request.url || ''));
  return request;
});

// Response interceptor for error handling
planApiInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Plan API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Fetch all available subscription plans
 * @returns Promise<Package[]> Array of subscription packages
 */
export const getAllPlans = async (): Promise<Package[]> => {
  try {
    const response = await planApiInstance.get('/api/plans');
    
    // Log response for debugging
    console.log('Plans API Response:', response.data);
    
    // Transform API response to match our Package interface if needed
    const plans = response.data;
    
    // Validate response structure
    if (!Array.isArray(plans)) {
      throw new Error('Invalid response format: expected array of plans');
    }
    
    // Map API response to Package interface
    const transformedPlans: Package[] = plans.map((plan: PlanApiResponse) => ({
      id: plan.planId?.toString() || '',
      name: plan.name || '',
      price: Number(plan.price) || 0,
      description: plan.description || '',
      features: [
        `${plan.dailyQuota} ly/ngày trong ${plan.durationDays} ngày`,
        `Sản phẩm: ${plan.productName}`,
        `Tối đa ${plan.maxPerVisit} ly mỗi lần ghé thăm`,
        plan.active ? 'Gói đang hoạt động' : 'Gói tạm ngưng'
      ],
      image: ensureHttps(plan.imageUrl) || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      popular: false, // Không có thông tin về gói phổ biến từ API
      durationDays: plan.durationDays // Thêm thông tin duration để sử dụng trong UI
    }));
    
    return transformedPlans;
    
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    
    // Handle specific error cases
    if (axiosError.response?.status === 404) {
      throw new Error('Plans API endpoint not found. Please check the server configuration.');
    }
    
    if (axiosError.response?.status === 500) {
      throw new Error('Server error occurred while fetching plans. Please try again later.');
    }
    
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }
    
    // Generic error message
    throw new Error('Failed to fetch subscription plans. Please try again later.');
  }
};

/**
 * Fetch a specific plan by ID
 * @param planId - The ID of the plan to fetch
 * @returns Promise<Package> Single subscription package
 */
export const getPlanById = async (planId: string): Promise<Package> => {
  try {
    const response = await planApiInstance.get(`/api/plans/${planId}`);
    const plan = response.data;
    
    // Transform single plan response
    const transformedPlan: Package = {
      id: plan.planId?.toString() || '',
      name: plan.name || '',
      price: Number(plan.price) || 0,
      description: plan.description || '',
      features: [
        `${plan.dailyQuota} ly/ngày trong ${plan.durationDays} ngày`,
        `Sản phẩm: ${plan.productName}`,
        `Tối đa ${plan.maxPerVisit} ly mỗi lần ghé thăm`,
        plan.active ? 'Gói đang hoạt động' : 'Gói tạm ngưng'
      ],
      image: ensureHttps(plan.imageUrl) || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      popular: false,
      durationDays: plan.durationDays
    };
    
    return transformedPlan;
    
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 404) {
      throw new Error(`Plan with ID "${planId}" not found.`);
    }
    
    throw new Error('Failed to fetch plan details. Please try again later.');
  }
};

/**
 * Check if plans API is available
 * @returns Promise<boolean>
 */
export const checkPlansApiHealth = async (): Promise<boolean> => {
  try {
    await planApiInstance.get('/api/plans');
    return true;
  } catch {
    return false;
  }
};
