import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { User } from '../types';
import { login as apiLogin, register as apiRegister, getMyProfile, verify as apiVerify } from '../utils/api';
import { storageUtils } from '../utils/localStorage';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; phone: string; password: string; address: string }) => Promise<boolean>;
  verifyAccount: (token: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = storageUtils.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin({ email, password });
      console.log('Raw login response:', response);
      
      // Xử lý response theo đúng format từ BE
      const token = response && typeof response === 'string' ? response : response?.token;
      
      if (token) {
        storageUtils.setToken(token);
        try {
          const profile = await getMyProfile(token);
          if (profile) {
            setUser(profile);
            storageUtils.setCurrentUser(profile);
            return true;
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };


  const register = async (userData: { name: string; email: string; phone: string; password: string; address: string }): Promise<boolean> => {
    try {
      const res = await apiRegister(userData);
      // Accept success when backend returns HTTP 200/201 or returns a truthy data object
      if (res && (res.status === 200 || res.status === 201 || !!res.data)) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

  const verifyAccount = async (token: string): Promise<boolean> => {
    try {
      const res = await apiVerify({ token });
      if ((typeof res === 'object' && res?.success) || res === true || (res && (res.status === 200 || res.status === 201 || !!res.data))) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Verify error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    storageUtils.setCurrentUser(null);
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      storageUtils.updateUser(updatedUser);
    }
  };

  // Đăng nhập Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser: FirebaseUser = result.user;
      // Tùy vào BE, có thể cần gửi token này lên BE để lấy token hệ thống
      // Ở đây chỉ lưu thông tin user Google vào localStorage
      const profile: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        password: '', // Google users don't have a password
        address: '',
        avatar: firebaseUser.photoURL || undefined,
      };
      setUser(profile);
      storageUtils.setCurrentUser(profile);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyAccount, logout, updateProfile, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}