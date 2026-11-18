import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';

export const SplashScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Badge */}
          <View style={styles.logoBadge}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.iconCircle}>
              <ShieldAlert size={44} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Campus Complaint System</Text>
          <Text style={styles.subtitle}>
            Real-Time AI Priority Engine & Direct Support Channel for Students
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>Instant AI Urgency & Priority Analysis</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>Live Resolution Tracking & Real-Time Chat</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>Direct Escalation to Department Admins</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <CustomButton
            title="Student Login"
            onPress={() => navigation.navigate('Login')}
            icon={<UserCheck size={20} color="#ffffff" />}
          />
          <CustomButton
            title="Create Student Account"
            variant="outline"
            onPress={() => navigation.navigate('Register')}
            icon={<ArrowRight size={18} color="#cbd5e1" />}
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBadge: {
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
    marginBottom: 32,
  },
  featuresContainer: {
    backgroundColor: '#1e293b80',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginRight: 12,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginBottom: 20,
  },
});

export default SplashScreen;
