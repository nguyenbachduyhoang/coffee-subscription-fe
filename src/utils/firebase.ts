// Firebase config and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD471Kn5MPoyqpr4VMtjWUVD5ZcjH9tmAQ',
  authDomain: 'swd392-8a6e9.firebaseapp.com',
  projectId: 'swd392-8a6e9',
  storageBucket: 'swd392-8a6e9.appspot.com',
  messagingSenderId: '424138218822',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
