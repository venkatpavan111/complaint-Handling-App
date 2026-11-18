import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';

export const ForgotPasswordScreen = ({ navigation }) => {
  const { sendPasswordReset, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your registered student email address.');
      return;
    }

    const res = await sendPasswordReset(email.trim());
    if (res && res.success) {
      setSuccessMessage(res.message);
      setSubmitted(true);
    } else {
      Alert.alert('Reset Failed', res.error || 'Could not send password reset email.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reset Password 🔑</Text>
        <Text style={styles.headerSub}>
          Enter your registered student email address and we'll send password reset instructions.
        </Text>

        {submitted ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Reset Email Sent! 📩</Text>
            <Text style={styles.successSub}>
              {successMessage || `We have dispatched a verification link to ${email}. Please check your inbox.`}
            </Text>
            <CustomButton
              title="Return to Login"
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <InputField
              label="Student Email Address"
              placeholder="e.g. student@univ.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color="#818cf8" />}
            />

            <CustomButton
              title="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              icon={<Send size={18} color="#ffffff" />}
              style={{ marginTop: 14 }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  successCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  successTitle: {
    color: '#34d399',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSub: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
