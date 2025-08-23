export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  avatar?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  popular?: boolean;
  durationDays?: number;
}

export interface PurchaseHistory {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  price: number;
  purchaseDate: string;
  paymentMethod: 'card' | 'vnpay';
}

export interface PaymentData {
  method: 'card' | 'vnpay';
  cardHolder?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

// Customer API request types
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  code: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}