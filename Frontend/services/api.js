import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ─────────────────────────────────────────────────────────────
//  BASE URL
//  • Android emulator  → 10.0.2.2  (maps to your PC's localhost)
//  • iOS simulator     → localhost
//  • Real phone (Expo Go) → YOUR PC's WiFi IP
//
//  ⚠️  ONLY CHANGE THE LINE BELOW — replace with your PC's IP
//      Run  ipconfig  (Windows) or  ifconfig  (Mac/Linux)
//      and look for the IPv4 address of your WiFi adapter
// ─────────────────────────────────────────────────────────────
const WIFI_IP = "192.168.2.114"; 

const getBaseURL = () => {
  if (Platform.OS === "android" && !__DEV__) return `http://${WIFI_IP}:5000/api`;
  if (Platform.OS === "android") return `http://10.0.2.2:5000/api`; // emulator
  if (Platform.OS === "ios") return `http://${WIFI_IP}:5000/api`;     // iOS sim
  return `http://${WIFI_IP}:5000/api`;                               // real phone
};

// Override: if you're on a real Android/iOS phone via Expo Go,
// always use the WiFi IP (emulator detection is unreliable in Expo Go)
const BASE_URL = `http://${WIFI_IP}:5000/api`;

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout so errors surface fast

});

// Attach token to every request
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // no token yet — fine for public routes
  }
  return config;
});

// Global error interceptor — logs network errors clearly
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — phone can't reach the server
      console.error(
        `❌ Network Error: Cannot reach ${BASE_URL}\n` +
        `   Make sure:\n` +
        `   1. Node server is running (node server.js)\n` +
        `   2. Phone and PC are on the same WiFi\n` +
        `   3. WIFI_IP in api.js matches your PC IP (run ipconfig)\n` +
        `   Current IP set to: ${WIFI_IP}`
      );
    }
    return Promise.reject(error);
  }
);

export default API;
