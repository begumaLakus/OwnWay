import axios from 'axios';

const API_URL = 'http://10.108.181.232:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;