import { User, PurchaseHistory, ContactMessage } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'cafedaily_current_user',
  USERS: 'cafedaily_users',
  PURCHASE_HISTORY: 'cafedaily_purchase_history',
  CONTACT_MESSAGES: 'cafedaily_contact_messages',
  TOKEN: 'cafedaily_token',
};
  // Token management

export const storageUtils = {
  // Token management
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  // User management
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getUsers: (): User[] => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  addUser: (user: User): void => {
    const users = storageUtils.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (updatedUser: User): void => {
    const users = storageUtils.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      storageUtils.setCurrentUser(updatedUser);
    }
  },

  // Purchase history
  getPurchaseHistory: (userId?: string): PurchaseHistory[] => {
    const history = localStorage.getItem(STORAGE_KEYS.PURCHASE_HISTORY);
    const purchases = history ? JSON.parse(history) : [];
    return userId ? purchases.filter((p: PurchaseHistory) => p.userId === userId) : purchases;
  },

  addPurchase: (purchase: PurchaseHistory): void => {
    const history = storageUtils.getPurchaseHistory();
    history.push(purchase);
    localStorage.setItem(STORAGE_KEYS.PURCHASE_HISTORY, JSON.stringify(history));
  },

  removePurchase: (purchaseId: string): void => {
    const history = storageUtils.getPurchaseHistory();
    const filtered = history.filter((p: PurchaseHistory) => p.id !== purchaseId);
    localStorage.setItem(STORAGE_KEYS.PURCHASE_HISTORY, JSON.stringify(filtered));
  },

  // Contact messages
  getContactMessages: (): ContactMessage[] => {
    const messages = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
    return messages ? JSON.parse(messages) : [];
  },

  addContactMessage: (message: ContactMessage): void => {
    const messages = storageUtils.getContactMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(messages));
  },
};