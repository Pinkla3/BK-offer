// Jeśli używasz Node.js w wersji niższej niż 18,
// warto zainstalować bibliotekę "node-fetch":
// npm install node-fetch
// i następnie zaimportować ją:
// const fetch = require('node-fetch');

const API_URL = "https://api-lockstep.berlin-opiekunki.pl/v1/offer";

const getAllOffers = async () => {
  const response = await fetch(`${API_URL}/all`);
  if (!response.ok) {
    throw new Error("Błąd przy pobieraniu ofert");
  }
  return await response.json();
};

const getOfferBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/${slug}`);
  if (!response.ok) {
    throw new Error("Błąd przy pobieraniu oferty");
  }
  return await response.json();
};

module.exports = {
  getAllOffers,
  getOfferBySlug,
};