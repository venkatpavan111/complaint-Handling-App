import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Tab & Admin Dashboard Navigators
import TabNavigator from './TabNavigator';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

// Complaint Flow Screens
import CategorySelectionScreen from '../screens/complaints/CategorySelectionScreen';
import CreateComplaintFormScreen from '../screens/complaints/CreateComplaintFormScreen';
import AIPriorityPreviewScreen from '../screens/complaints/AIPriorityPreviewScreen';
import TicketConfirmationScreen from '../screens/complaints/TicketConfirmationScreen';
import TicketDetailTimelineScreen from '../screens/complaints/TicketDetailTimelineScreen';
import StudentProfileScreen from '../screens/profile/StudentProfileScreen';

// Live Communication & Feedback Screens
import RealtimeChatScreen from '../screens/chat/RealtimeChatScreen';
import ResolutionFeedbackScreen from '../screens/feedback/ResolutionFeedbackScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const isAdmin = user && user.role === 'ADMIN';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f172a' },
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : isAdmin ? (
          // Admin Command Center Stack
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="TicketDetailTimeline" component={TicketDetailTimelineScreen} />
            <Stack.Screen name="RealtimeChat" component={RealtimeChatScreen} />
            <Stack.Screen name="Profile" component={StudentProfileScreen} />
          </>
        ) : (
          // Student Main App Stack
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} />
            <Stack.Screen name="CreateComplaintForm" component={CreateComplaintFormScreen} />
            <Stack.Screen name="AIPriorityPreview" component={AIPriorityPreviewScreen} />
            <Stack.Screen name="TicketConfirmation" component={TicketConfirmationScreen} />
            <Stack.Screen name="TicketDetailTimeline" component={TicketDetailTimelineScreen} />
            <Stack.Screen name="RealtimeChat" component={RealtimeChatScreen} />
            <Stack.Screen name="ResolutionFeedback" component={ResolutionFeedbackScreen} />
            <Stack.Screen name="Profile" component={StudentProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
