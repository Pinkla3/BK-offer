import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3009', // <-- Adres Twojego backendu
  withCredentials: false, // lub true, jeśli używasz cookies
});

export default instance;
