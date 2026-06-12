import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Token'ı güvenli depolama için

const API_URL = 'http://172.20.10.3:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',

  },
});

// İsteği göndermeden önce token'ı otomatik ekle
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;