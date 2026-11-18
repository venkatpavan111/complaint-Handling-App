import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDqsEvux566NZ-0E5QU-PPB3u2AAIfti6M",
  authDomain: "compliant--handling.firebaseapp.com",
  projectId: "compliant--handling",
  storageBucket: "compliant--handling.firebasestorage.app",
  messagingSenderId: "417342150988",
  appId: "1:417342150988:web:c65c8f3c74f515d287d7e9",
  measurementId: "G-W8E2DG3CL4"
};

let app;
let auth;
let db;
let storage;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('[Firebase Web Initialization Warning]', error.message);
}

export { app, auth, db, storage };
export default firebaseConfig;