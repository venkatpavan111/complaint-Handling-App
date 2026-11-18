import auth, { app, getFirebaseErrorMessage, GoogleAuthProvider, signInWithCredential } from './firebase';
import { getFirestore } from 'firebase/firestore';

let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.warn('[Firestore Initialization Warning]', error.message);
}

export { app, auth, db, getFirebaseErrorMessage, GoogleAuthProvider, signInWithCredential };
export default auth;
