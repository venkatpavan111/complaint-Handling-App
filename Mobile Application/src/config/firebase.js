import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDqsEvux566NZ-0E5QU-PPB3u2AAIfti6M",
  authDomain: "compliant--handling.firebaseapp.com",
  projectId: "compliant--handling",
  storageBucket: "compliant--handling.firebasestorage.app",
  messagingSenderId: "417342150988",
  appId: "1:417342150988:web:c65c8f3c74f515d287d7e9",
  measurementId: "G-W8E2DG3CL4"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;