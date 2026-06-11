import axios from 'axios';



const API_URL = 'http://192.168.1.110:3000/api';


export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',

  },
});

export default api;