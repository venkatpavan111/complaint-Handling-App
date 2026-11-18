import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import {
  Mail,
  Lock,
  LogIn,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Send
} from 'lucide-react-native';

export const LoginScreen = ({ navigation }) => {
  const { login, resendVerification, loading } = useContext(AuthContext);
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPassword, setVerificationPassword] = useState('');

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmailOrId(demoEmail);
    setPassword(demoPass);
    setError('');
    setNeedsVerification(false);
  };

  const handleLogin = async () => {
    if (!emailOrId.trim()) {
      setError('Please enter your Campus Email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setNeedsVerification(false);
    const res = await login(emailOrId.trim(), password);
    if (res && res.success) {
      // Successfully authenticated via Firebase
    } else if (res && res.error) {
      setError(res.error);
      if (res.needsVerification) {
        setNeedsVerification(true);
        setVerificationEmail(res.email);
        setVerificationPassword(res.password);
      } else {
        Alert.alert('Authentication Failed', res.error);
      }
    }
  };

  const handleResend = async () => {
    const res = await resendVerification(verificationEmail, verificationPassword);
    if (res && res.success) {
      Alert.alert('Email Sent', res.message);
      setNeedsVerification(false);
    } else {
      Alert.alert('Error', res.error || 'Failed to resend verification email.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Brand Shield Logo */}
        <View style={styles.logoBadge}>
          <View style={styles.iconCircle}>
            <ShieldAlert size={36} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.headerTitle}>Welcome Back 👋</Text>
        <Text style={styles.headerSub}>
          Sign in via Firebase Authentication to access AI priority tracking & campus support
        </Text>

        {/* Quick Demo Credentials Assistant */}
        <View style={styles.demoCard}>
          <View style={styles.demoTitleRow}>
            <Sparkles size={14} color="#f59e0b" />
            <Text style={styles.demoTitle}>TEST & DEMO ACCOUNTS</Text>
          </View>

          <View style={styles.demoGrid}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoFill('student@univ.edu', 'Student@123')}
            >
              <UserCheck size={16} color="#818cf8" />
              <View>
                <Text style={styles.demoBtnTitle}>Student Demo</Text>
                <Text style={styles.demoBtnSub}>student@univ.edu</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoFill('admin@univ.edu', 'Admin@123')}
            >
              <ShieldCheck size={16} color="#c084fc" />
              <View>
                <Text style={styles.demoBtnTitle}>Admin Demo</Text>
                <Text style={styles.demoBtnSub}>admin@univ.edu</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Firebase Error Message Banner */}
        {error ? (
          <View style={styles.errorBannerRow}>
            <AlertCircle size={18} color="#f87171" style={{ marginTop: 1 }} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Unverified Email Resend Option */}
        {needsVerification ? (
          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>Email Not Verified ⚠️</Text>
            <Text style={styles.verificationSub}>
              Please verify your email address before signing in. Check your inbox or spam folder for the verification link.
            </Text>
            <CustomButton
              title="Resend Verification Email"
              onPress={handleResend}
              loading={loading}
              icon={<Send size={16} color="#ffffff" />}
              style={{ backgroundColor: '#f59e0b', marginTop: 10 }}
            />
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <InputField
            label="Campus Email *"
            placeholder="e.g. student@univ.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailOrId}
            onChangeText={(txt) => {
              setEmailOrId(txt);
              if (error) setError('');
            }}
            icon={<Mail size={18} color="#818cf8" />}
          />

          <InputField
            label="Password *"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (error) setError('');
            }}
            icon={<Lock size={18} color="#818cf8" />}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In with Firebase"
            onPress={handleLogin}
            loading={loading}
            icon={<LogIn size={18} color="#ffffff" />}
            style={{ marginTop: 10 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpText}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  demoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  demoTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  demoBtnTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  demoBtnSub: {
    color: '#64748b',
    fontSize: 10,
  },
  errorBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ef444420',
    borderColor: '#ef4444',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    color: '#f87171',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  verificationCard: {
    backgroundColor: '#451a03',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  verificationTitle: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  verificationSub: {
    color: '#fde68a',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  formContainer: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signUpText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
