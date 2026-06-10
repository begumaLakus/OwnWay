import axios from 'axios';

<<<<<<< Updated upstream
const API_URL = 'http://10.37.84.55:3000/api';
=======
const API_URL = 'http://192.168.1.100:3000/api';
>>>>>>> Stashed changes

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;