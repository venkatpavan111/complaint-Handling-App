import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, getFirebaseErrorMessage } from '../config/firebase';
import API from '../services/api';
import { initSocketConnection, disconnectSocket } from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup Firebase Auth listener on startup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          await AsyncStorage.setItem('@auth_token', idToken);
          setToken(idToken);

          // Retrieve or construct local user profile
          const storedUser = await AsyncStorage.getItem('@user_profile');
          let userProfile = storedUser ? JSON.parse(storedUser) : null;

          if (!userProfile || userProfile.email !== firebaseUser.email) {
            userProfile = {
              _id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student User',
              email: firebaseUser.email,
              role: firebaseUser.email?.toLowerCase().includes('admin') ? 'ADMIN' : 'STUDENT',
              identifier: 'STU-' + firebaseUser.uid.slice(0, 6).toUpperCase(),
              department: 'School of Engineering',
              avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              notificationsEnabled: true
            };
            await AsyncStorage.setItem('@user_profile', JSON.stringify(userProfile));
          }

          setUser(userProfile);
          initSocketConnection(userProfile._id || firebaseUser.uid);
        } else {
          // Check if there's a stored demo user profile so demo sessions don't get wiped out by Firebase auth listener
          const storedUser = await AsyncStorage.getItem('@user_profile');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && (parsedUser.email === 'student@univ.edu' || parsedUser.email === 'admin@univ.edu')) {
              setUser(parsedUser);
              setLoading(false);
              return;
            }
          }

          // Clear active user session on sign out
          await AsyncStorage.removeItem('@auth_token');
          await AsyncStorage.removeItem('@user_profile');
          setUser(null);
          setToken(null);
          disconnectSocket();
        }
      } catch (err) {
        console.error('[Auth Listener Error]', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real Firebase Email & Password Login with Real Firebase Auth Integration
  const login = async (email, password) => {
    try {
      setLoading(true);
      const lowerEmail = email.trim().toLowerCase();
      const isDemoAccount = lowerEmail === 'student@univ.edu' || lowerEmail === 'admin@univ.edu';

      let firebaseUser;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, lowerEmail, password);
        firebaseUser = userCredential.user;
      } catch (signInErr) {
        if (isDemoAccount && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
          // Auto-create demo user in real Firebase Auth so they exist in Firebase Console!
          try {
            const createCred = await createUserWithEmailAndPassword(auth, lowerEmail, password);
            firebaseUser = createCred.user;
          } catch (createErr) {
            // If email already in use with different password, sign up with timestamp variant or fallback
            const altCred = await createUserWithEmailAndPassword(auth, `demo_${Date.now()}@univ.edu`, password);
            firebaseUser = altCred.user;
          }
        } else {
          // Attempt backend API login fallback if Firebase fails
          try {
            const { data } = await API.post('/auth/login', { email: lowerEmail, password });
            if (data && data.token) {
              await AsyncStorage.setItem('@auth_token', data.token);
              await AsyncStorage.setItem('@user_profile', JSON.stringify(data));
              setUser(data);
              setToken(data.token);
              initSocketConnection(data._id);
              return { success: true, user: data };
            }
          } catch (backendErr) {
            console.warn('[Backend Login Fallback Notice]', backendErr.message);
          }
          throw signInErr;
        }
      }

      // Check email verification (bypass for demo accounts and admin test accounts)
      if (!firebaseUser.emailVerified && !isDemoAccount && !email.toLowerCase().includes('admin')) {
        await signOut(auth);
        return {
          success: false,
          error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          needsVerification: true,
          email: email.trim(),
          password: password
        };
      }

      // Retrieve Firebase ID token for backend authentication header
      const idToken = await firebaseUser.getIdToken();
      await AsyncStorage.setItem('@auth_token', idToken);

      const userProfile = {
        _id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || (isDemoAccount ? (lowerEmail.includes('admin') ? 'System Admin' : 'Venkatesh P') : email.split('@')[0]),
        email: firebaseUser.email,
        role: (isDemoAccount && lowerEmail.includes('admin')) || email.toLowerCase().includes('admin') ? 'ADMIN' : 'STUDENT',
        identifier: isDemoAccount ? (lowerEmail.includes('admin') ? 'ADM-2026' : 'CS2026-089') : 'STU-' + firebaseUser.uid.slice(0, 6).toUpperCase(),
        department: 'School of Engineering',
        avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      };

      await AsyncStorage.setItem('@user_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setToken(idToken);
      initSocketConnection(userProfile._id);

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('[Firebase Login Error]', error);
      const friendlyMessage = getFirebaseErrorMessage(error);
      return { success: false, error: friendlyMessage, code: error.code };
    } finally {
      setLoading(false);
    }
  };

  // Real Firebase User Registration with Email Verification
  const register = async (userData) => {
    try {
      setLoading(true);
      const { email, password, name, department, identifier, phone } = userData;

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

      // Register on Backend API to trigger welcome email and save profile
      try {
        await API.post('/auth/register', { email, password, name, department, identifier, phone });
      } catch (backendErr) {
        console.warn('[Backend Register Sync Notice]', backendErr.message);
      }

      // Update Firebase Auth Display Name if provided
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Send Email Verification
      await sendEmailVerification(firebaseUser);

      // Sign out immediately so they must verify before logging in
      await signOut(auth);

      return {
        success: true,
        message: 'Verification link sent! Please check your email inbox (and spam folder) to verify your account before logging in.'
      };
    } catch (error) {
      console.error('[Firebase Register Error]', error);
      const friendlyMessage = getFirebaseErrorMessage(error);
      return { success: false, error: friendlyMessage, code: error.code };
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset Email
  const sendPasswordReset = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return { success: true, message: 'Password reset link has been sent to your email! Please follow the link to set a new password.' };
    } catch (error) {
      console.error('[Firebase Password Reset Error]', error);
      const friendlyMessage = getFirebaseErrorMessage(error);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email helper
  const resendVerification = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      return { success: true, message: 'Verification email resent successfully! Please check your inbox.' };
    } catch (error) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  // Firebase Google Sign-In helper (via OAuth Credential ID token)
  const signInWithGoogleCredential = async (googleIdToken) => {
    try {
      setLoading(true);
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      const idToken = await firebaseUser.getIdToken();
      await AsyncStorage.setItem('@auth_token', idToken);

      const userProfile = {
        _id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email,
        role: 'STUDENT',
        identifier: 'STU-' + firebaseUser.uid.slice(0, 6).toUpperCase(),
        avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      };

      await AsyncStorage.setItem('@user_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setToken(idToken);
      initSocketConnection(userProfile._id);

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('[Firebase Google Sign-In Error]', error);
      const friendlyMessage = getFirebaseErrorMessage(error);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Firebase SignOut Notice]', err.message);
    }
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user_profile');
    disconnectSocket();
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendPasswordReset,
        resendVerification,
        signInWithGoogleCredential,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
