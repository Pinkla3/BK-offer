import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://217.154.69.216:3001', // <-- Adres Twojego backendu
  withCredentials: false, // lub true, jeśli używasz cookies
});

export default instance;
