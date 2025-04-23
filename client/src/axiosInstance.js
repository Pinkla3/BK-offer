import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://desk.berlin-opiekunki.pl', // <-- Adres Twojego backendu
  withCredentials: false, // lub true, jeśli używasz cookies
});

export default instance;
