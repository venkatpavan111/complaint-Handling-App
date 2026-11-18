import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import {
  Shield,
  User,
  Lock,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Mail
} from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [department, setDepartment] = useState('General Department');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail, demoPassword, demoRole) => {
    setIsRegistering(false);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
    setError('');
    setSuccessMsg('');
  };

  const validateEmail = (emailStr) => {
    if (!emailStr) return false;
    const clean = emailStr.toLowerCase().trim();
    // Accept any valid email format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
  };

  const getFirebaseErrorMessage = (error) => {
    if (!error) return 'Authentication failed. Please verify credentials.';
    const code = error.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'The email address format is invalid.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials.';
      default:
        if (error.response?.data?.message) {
          return error.response.data.message;
        }
        return error.message || code || 'Authentication failed. Please verify credentials.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Domain Check
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        let firebaseSuccess = false;
        let firebaseUser = null;

        // 1. Firebase Auth student registration
        if (auth) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            firebaseUser = userCredential.user;
            firebaseSuccess = true;

            // 2. Create student document in Firestore under users/${user.uid}
            if (db) {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                fullName: name,
                email: email,
                department: department,
                rollNumber: identifier,
                role: 'student'
              });
            }
          } catch (fbErr) {
            console.error('Firebase Auth Error:', fbErr.code, fbErr.message);
            // Halt and show specific UI message if Firebase credential rule is broken
            if (['auth/email-already-in-use', 'auth/weak-password', 'auth/invalid-email'].includes(fbErr.code)) {
              setError(getFirebaseErrorMessage(fbErr));
              setLoading(false);
              return;
            }
          }
        }

        // 3. Complete Backend API registration
        const userData = { name, email, password, role: 'STUDENT', department, identifier };
        await register(userData);
        setSuccessMsg(`Registration successful! 🎉 A welcome confirmation email has been dispatched to ${email}. Please sign in to enter the portal.`);
        setIsRegistering(false);
        setError('');
      } else {
        // Sign In Flow — Backend JWT is the primary auth path
        // Firebase Auth is optional/secondary; errors don't block login
        if (auth) {
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (fbErr) {
            console.warn('[Firebase Auth] Skipped:', fbErr.code || fbErr.message);
            // Continue to backend login regardless of Firebase result
          }
        }

        const user = await login(email, password);
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('Authentication Error:', error);
      // Check if backend server is unreachable
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setError('Cannot reach the backend server. Please make sure the backend is running on http://localhost:5000');
      } else {
        const displayMsg = getFirebaseErrorMessage(error);
        setError(displayMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Dynamic Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md mx-auto z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-indigo-950/50 relative overflow-hidden">
          
          {/* Top Logo & Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 mb-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-indigo-400 tracking-wider uppercase mb-1">
              ResolveQ
            </h1>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isRegistering ? 'Create Student Account' : 'Campus Portal Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Student & Admin Authentication Portal
            </p>
          </div>

          {/* Quick One-Click Demo Bar */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('student@gmail.com', 'Student@123', 'STUDENT')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-800 text-left transition-all text-xs group"
              >
                <UserCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white text-xs">Student Login</div>
                  <div className="text-[10px] text-slate-400 truncate">student@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@gmail.com', 'Admin@123', 'ADMIN')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900 hover:bg-purple-600/20 hover:border-purple-500/40 border border-slate-800 text-left transition-all text-xs group"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white text-xs">Admin Login</div>
                  <div className="text-[10px] text-slate-400 truncate">admin@gmail.com</div>
                </div>
              </button>
            </div>
          </div>

          {/* Sign In vs Register Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isRegistering
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isRegistering
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Student Register
            </button>
          </div>

          {successMsg && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-200">Account Registered Successfully!</span>
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed flex items-start space-x-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Student Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Venkatapavan P"
                    className="bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Saveetha SSE"
                      className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Roll / Student ID
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 2026-SSE-089"
                      className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Complete Registration' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Secure Authentication Portal
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
