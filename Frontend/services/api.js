// import axios from "axios";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const API = axios.create({
//   baseURL: "http://192.168.2.114:5000/api",
// });

// API.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default API;

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Change this IP to your computer's local IP when testing on a real device
const API = axios.create({
  baseURL: "http://192.168.2.114:5000/api",
});

// Automatically attach the saved token to every request
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // no token saved yet — that's fine for public routes
  }
  return config;
});

export default API;
