import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect PC host IP when running via Expo on a physical phone or emulator
const getBaseUrl = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest?.debuggerHost ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // Fallback to PC Wi-Fi IP so physical devices on Wi-Fi can reach the backend
  return 'http://10.248.202.127:5000/api';
};

const BASE_URL = getBaseUrl();

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching auth token from storage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const BASE_BACKEND_URL = BASE_URL.replace('/api', '');

export default API;
