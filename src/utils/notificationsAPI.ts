import axios, { AxiosError } from 'axios';
import { storageUtils } from './localStorage';

// Shape is flexible because backend may evolve. Use optional fields and pass-through mapping.
export interface NotificationItem {
  id?: string | number;
  title?: string;
  message?: string;
  content?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  link?: string;
  // Keep raw for any additional fields to avoid strict coupling
  [key: string]: unknown;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://minhkhoi02-001-site1.anytempurl.com';

const notificationsApiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

notificationsApiInstance.interceptors.request.use(request => {
  console.log('Notifications API Request:', (request.baseURL || '') + (request.url || ''));
  return request;
});

notificationsApiInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Notifications API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Fetch notifications of the currently logged-in user
 */
export const getMyNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const token = storageUtils.getToken();
    if (!token) throw new Error('Authentication token not found. Please login first.');

    const response = await notificationsApiInstance.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // API may return either an array or an object with data field
    const raw = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    const items = (raw || []) as unknown[];

    // Light normalization to a consistent interface while preserving unknown fields
    const toString = (val: unknown): string | undefined =>
      typeof val === 'string' ? val : val != null ? String(val) : undefined;
    const toBoolean = (val: unknown): boolean | undefined =>
      typeof val === 'boolean' ? val : undefined;

    const normalized: NotificationItem[] = items.map((r: unknown) => {
      const obj = (r as Record<string, unknown>) || {};
      return {
        id: obj['id'] as string | number | undefined,
        title: toString(obj['title'] ?? obj['subject']),
        message: toString(obj['message'] ?? obj['content']),
        content: toString(obj['content'] ?? obj['message']),
        type: toString(obj['type'] ?? obj['category']),
        isRead: toBoolean(obj['isRead'] ?? obj['read']),
        createdAt: toString(obj['createdAt'] ?? obj['created_at'] ?? obj['time']),
        link: toString(obj['link'] ?? obj['url']),
        ...obj
      } as NotificationItem;
    });

    return normalized;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    if (axiosError.response?.status === 403) {
      throw new Error('Access forbidden. Customer role required.');
    }
    if (axiosError.response?.status === 404) {
      // Endpoint exists in backend; if not, surface a friendly hint
      throw new Error('Notifications endpoint not found. Please check the server configuration.');
    }
    if (axiosError.response?.status === 500) {
      throw new Error('Server error occurred while fetching notifications. Please try again later.');
    }

    const fallback =
      (axiosError.response?.data as { message?: string } | undefined)?.message ||
      axiosError.message ||
      'Failed to fetch notifications. Please try again later.';
    throw new Error(fallback);
  }
};

/**
 * Simple health check for notifications API
 */
export const checkNotificationsApiHealth = async (): Promise<boolean> => {
  try {
    const token = storageUtils.getToken();
    if (!token) return false;
    await notificationsApiInstance.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch {
    return false;
  }
};


