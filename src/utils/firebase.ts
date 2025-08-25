// Firebase config and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAUoNGXwJ9gWu79L0_xX4x2u5fsRaqL9TU',
  authDomain: 'coffee-2e61f.firebaseapp.com',
  projectId: 'coffee-2e61f',
  storageBucket: 'coffee-2e61f.appspot.com',
  messagingSenderId: '858853049962',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
