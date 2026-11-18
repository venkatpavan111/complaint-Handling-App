import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ComplaintsProvider } from './src/context/ComplaintsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ComplaintsProvider>
          <StatusBar style="light" backgroundColor="#0f172a" />
          <AppNavigator />
        </ComplaintsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
