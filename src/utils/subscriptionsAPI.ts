import { AxiosError } from 'axios';
import { axiosInstance } from './api';
import { storageUtils } from './localStorage';

// API Response interfaces
interface OrderSubscriptionRequest {
  planId: number;
}

export interface OrderSubscriptionData {
  subscriptionId: number;
  customerId: number;
  customerName: string;
  planId: number;
  planName: string;
  productId: number;
  productName: string;
  imageUrl: string;
  startDate: string | null;
  endDate: string | null;
  remainingDays: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  status: 'PendingPayment' | 'Active' | 'Expired' | 'Cancelled';
}

export interface OrderSubscriptionResponse {
  success: boolean;
  message: string;
  data: OrderSubscriptionData;
  qrUrl: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  transferContent: string;
  amount: number;
}

// Payment info for an existing subscription (re-generate/fetch QR)
export interface SubscriptionPaymentInfoResponse {
  success: boolean;
  message: string;
  qrUrl: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  transferContent: string;
  amount: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

// Base URL is managed centrally in axiosInstance (utils/api.ts)

const subscriptionApiInstance = axiosInstance;

// Add request interceptor for debugging
subscriptionApiInstance.interceptors.request.use(request => {
  console.log('Subscription API Request:', (request.baseURL || '') + (request.url || ''));
  return request;
});

// Response interceptor for error handling
subscriptionApiInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Subscription API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Order a subscription plan
 * @param planId - The ID of the plan to subscribe to
 * @returns Promise<OrderSubscriptionResponse> Response from the API with QR code info
 */
export const orderSubscription = async (planId: number): Promise<OrderSubscriptionResponse> => {
  try {
    // Get token from localStorage
    const token = storageUtils.getToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login first.');
    }

    // Prepare request data
    const requestData: OrderSubscriptionRequest = {
      planId: planId
    };

    // Make API call
    const response = await subscriptionApiInstance.post('/api/subscriptions', requestData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Log response for debugging
    console.log('Order Subscription Response:', response.data);
    
    // Return the full response data including QR info
    return {
      success: true,
      message: response.data.message || 'Subscription ordered successfully',
      data: response.data.data,
      qrUrl: response.data.qrUrl,
      bankAccount: response.data.bankAccount,
      bankName: response.data.bankName,
      accountHolder: response.data.accountHolder,
      transferContent: response.data.transferContent,
      amount: response.data.amount
    };
    
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    
    console.error('Order Subscription Error:', axiosError);
    
    // Handle specific error cases
    if (axiosError.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    
    if (axiosError.response?.status === 403) {
      throw new Error('Access forbidden. Customer role required.');
    }
    
    if (axiosError.response?.status === 404) {
      throw new Error('Subscription API endpoint not found. Please check the server configuration.');
    }
    
    if (axiosError.response?.status === 400) {
      const errorData = axiosError.response?.data as ApiErrorResponse;
      const errorMessage = errorData?.message || 'Invalid request data.';
      throw new Error(errorMessage);
    }
    
    if (axiosError.response?.status === 500) {
      throw new Error('Server error occurred while processing subscription. Please try again later.');
    }
    
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }
    
    // Generic error message
    const errorData = axiosError.response?.data as ApiErrorResponse;
    const message = errorData?.message || 
                   axiosError.message || 
                   'Failed to order subscription. Please try again later.';
    throw new Error(message);
  }
};

/**
 * Fetch payment information (QR, bank details) for an existing subscription
 * so the user can pay again if it's still pending.
 */
export const getSubscriptionPaymentInfo = async (
  subscriptionId: string
): Promise<SubscriptionPaymentInfoResponse> => {
  try {
    const token = storageUtils.getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login first.');
    }

    // Primary, expected endpoint
    const url = `/api/subscriptions/${subscriptionId}/payment-info`;

    const response = await subscriptionApiInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const body = response.data || {};
    return {
      success: true,
      message: body.message || 'Fetched payment info successfully',
      qrUrl: body.qrUrl,
      bankAccount: body.bankAccount,
      bankName: body.bankName,
      accountHolder: body.accountHolder,
      transferContent: body.transferContent,
      amount: body.amount
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 404) {
      throw new Error('Không tìm thấy thông tin thanh toán cho subscription này.');
    }
    if (axiosError.response?.status === 401) {
      throw new Error('Bạn cần đăng nhập lại để tiếp tục.');
    }
    if (axiosError.response?.status === 403) {
      throw new Error('Bạn không có quyền thực hiện thao tác này.');
    }
    if (axiosError.response?.status === 500) {
      throw new Error('Máy chủ gặp lỗi khi lấy thông tin thanh toán.');
    }

    const fallbackMessage =
      (axiosError.response?.data as ApiErrorResponse)?.message ||
      axiosError.message ||
      'Không thể lấy thông tin thanh toán. Vui lòng thử lại sau.';
    throw new Error(fallbackMessage);
  }
};

// Fetch current user's subscriptions from backend
export interface UserSubscriptionItem {
  subscriptionId: string;
  planId: number;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  productName?: string;
  imageUrl?: string;
  remainingDays?: number | null;
}

export const getUserSubscriptions = async (): Promise<UserSubscriptionItem[]> => {
  const token = storageUtils.getToken();
  if (!token) throw new Error('NO_TOKEN');

  const response = await subscriptionApiInstance.get('/api/subscriptions/my-subscriptions', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const apiData = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  const arrayData = (apiData || []) as unknown[];

  const toNumber = (val: unknown, fallback = 0): number =>
    typeof val === 'number' ? val : Number(val ?? fallback);

  const toString = (val: unknown, fallback = ''): string =>
    typeof val === 'string' ? val : val != null ? String(val) : fallback;

  const normalized: UserSubscriptionItem[] = arrayData.map((raw: unknown) => {
    const r = raw as Record<string, unknown>;
    const plan = (r['plan'] as Record<string, unknown>) || {};
    return {
      subscriptionId: toString(r['subscriptionId'] ?? r['id']),
      planId: toNumber(r['planId'] ?? plan['planId']),
      planName: toString(r['planName'] ?? plan['name']),
      status: toString(r['status']),
      startDate: toString(r['startDate'] ?? r['createdAt']),
      endDate: toString(r['endDate']),
      price: toNumber(r['price'] ?? r['amount']),
      productName: toString(r['productName'] ?? (r['product'] as Record<string, unknown> | undefined)?.['name']),
      imageUrl: toString(r['imageUrl'] ?? (r['product'] as Record<string, unknown> | undefined)?.['imageUrl']),
      remainingDays: toNumber(r['remainingDays'] ?? (r['remaining'] ?? null), null as unknown as number),
    };
  });

  return normalized;
};

// Attempt to cancel a subscription via API. Returns false if not supported
export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const token = storageUtils.getToken();
    if (!token) return false;

    const response = await subscriptionApiInstance.delete(`/api/subscriptions/${subscriptionId}` , {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
};

/**
 * Check if subscription API is available
 * @returns Promise<boolean>
 */
export const checkSubscriptionApiHealth = async (): Promise<boolean> => {
  try {
    const token = storageUtils.getToken();
    if (!token) return false;
    
    // Simple health check - try to make a request to see if API is responsive
    // Note: This might fail if there are no plans available, but that's OK for health check
    await subscriptionApiInstance.get('/api/plans', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch {
    return false;
  }
};