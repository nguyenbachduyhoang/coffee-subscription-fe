import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { User } from '../types';
import { login as apiLogin, register as apiRegister, getMyProfile } from '../utils/api';
import { storageUtils } from '../utils/localStorage';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; phone: string; password: string; address: string }) => Promise<boolean>;
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
      const res = await apiLogin({ email, password });
      // Nếu BE trả về token dạng text
      if (res && typeof res === 'string' && res.length > 100) {
        storageUtils.setToken(res);
        // Lấy profile từ BE
        const profile = await getMyProfile(res);
        if (profile) {
          setUser(profile);
          storageUtils.setCurrentUser(profile);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };


  const register = async (userData: { name: string; email: string; phone: string; password: string; address: string }): Promise<boolean> => {
    try {
      const res = await apiRegister(userData);
      // Nếu BE trả về token dạng text (giống login)
      if (res && typeof res === 'string' && res.length > 100) {
        storageUtils.setToken(res);
        const profile = await getMyProfile(res);
        if (profile) {
          setUser(profile);
          storageUtils.setCurrentUser(profile);
        }
        return true;
      }
      // Nếu BE trả về object có token
      if (res && res.token) {
        storageUtils.setToken(res.token);
        const profile = await getMyProfile(res.token);
        if (profile) {
          setUser(profile);
          storageUtils.setCurrentUser(profile);
        }
        return true;
      }
      // Nếu BE trả về object có success
      if (res && res.success) {
        return true;
      }
      return false;
    } catch {
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
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loginWithGoogle }}>
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