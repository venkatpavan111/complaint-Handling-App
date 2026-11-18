import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { User, Mail, Lock, Phone, BookOpen, Layers, PhoneCall, ArrowLeft, UserPlus } from 'lucide-react-native';

export const RegisterScreen = ({ navigation }) => {
  const { register, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    identifier: '',
    department: '',
    year: '',
    section: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleRegister = async () => {
    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.identifier.trim()) return setError('Student ID is required');
    if (!formData.password) return setError('Password is required');

    setError('');
    const res = await register(formData);
    if (res && res.success) {
      Alert.alert(
        'Verification Link Sent!',
        res.message || 'Please check your email inbox (and spam folder) to verify your account before logging in.',
        [{ text: 'Sign In Now', onPress: () => navigation.navigate('Login') }]
      );
    } else if (res && res.error) {
      setError(res.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Student Account 🎓</Text>
        <Text style={styles.headerSub}>Register to submit complaints and track live support status</Text>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <View style={styles.formContainer}>
          <InputField
            label="Full Name *"
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(val) => handleChange('name', val)}
            icon={<User size={18} color="#818cf8" />}
          />

          <InputField
            label="Student Email *"
            placeholder="j.doe@student.univ.edu"
            value={formData.email}
            onChangeText={(val) => handleChange('email', val)}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color="#818cf8" />}
          />

          <InputField
            label="Student ID / Roll Number *"
            placeholder="CS2026-089"
            value={formData.identifier}
            onChangeText={(val) => handleChange('identifier', val)}
            icon={<BookOpen size={18} color="#818cf8" />}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <InputField
                label="Department"
                placeholder="CSE / ECE / ME"
                value={formData.department}
                onChangeText={(val) => handleChange('department', val)}
                icon={<Layers size={16} color="#818cf8" />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <InputField
                label="Year of Study"
                placeholder="3rd Year"
                value={formData.year}
                onChangeText={(val) => handleChange('year', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <InputField
                label="Section"
                placeholder="Sec B"
                value={formData.section}
                onChangeText={(val) => handleChange('section', val)}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <InputField
                label="Phone Number"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChangeText={(val) => handleChange('phone', val)}
                keyboardType="phone-pad"
                icon={<PhoneCall size={16} color="#818cf8" />}
              />
            </View>
          </View>

          <InputField
            label="Password *"
            placeholder="••••••••"
            secureTextEntry
            value={formData.password}
            onChangeText={(val) => handleChange('password', val)}
            icon={<Lock size={18} color="#818cf8" />}
          />

          <CustomButton
            title="Register & Continue"
            onPress={handleRegister}
            loading={loading}
            icon={<UserPlus size={18} color="#ffffff" />}
            style={{ marginTop: 14 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Sign In</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
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
  },
  errorBanner: {
    backgroundColor: '#ef444420',
    borderColor: '#ef4444',
    borderWidth: 1,
    color: '#f87171',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  formContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
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
  loginText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RegisterScreen;
