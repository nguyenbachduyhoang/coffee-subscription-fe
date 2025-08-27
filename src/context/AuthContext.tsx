import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

import { User } from '../types';
import { login as apiLogin, register as apiRegister, getMyProfile, verify as apiVerify, loginWithGoogle as apiLoginWithGoogle } from '../utils/api';
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
    storageUtils.removeToken();
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      storageUtils.updateUser(updatedUser);
    }
  };

  // Đăng nhập Google -> gửi Google OAuth ID token (nếu có) hoặc Firebase ID token
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser: FirebaseUser = result.user;
      // Backend yêu cầu Firebase ID token (aud = projectId). Luôn dùng Firebase token.
      const firebaseIdToken = await firebaseUser.getIdToken(true);
      const tokenToSend = firebaseIdToken;
      if (!tokenToSend) {
        console.error('No ID token obtained from Google/Firebase');
        return false;
      }
      console.log('Using token type:', 'firebaseIdToken');
      const data = await apiLoginWithGoogle(tokenToSend);
      const token = data && (data.token || data);
      if (!token) return false;

      storageUtils.setToken(token);
      try {
        const profile = await getMyProfile(token);
        if (profile) {
          setUser(profile);
          storageUtils.setCurrentUser(profile);
          return true;
        }
      } catch (profileError) {
        console.error('Error fetching profile after Google login:', profileError);
      }
      return false;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Google login error:', err.response?.status, err.response?.data || err.message);
      } else {
        console.error('Google login error:', err);
      }
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