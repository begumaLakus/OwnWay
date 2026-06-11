import axios from 'axios';

<<<<<<< Updated upstream
const API_URL = 'http://192.168.1.244:3000/api';
=======
const API_URL = 'http://192.168.1.110:3000/api';
>>>>>>> Stashed changes

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;