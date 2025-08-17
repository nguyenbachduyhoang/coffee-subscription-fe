export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
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