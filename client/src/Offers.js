// Offers.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const OffersTable = () => {
  const [offers, setOffers] = useState([]); // wszystkie oferty
  const [filteredOffers, setFilteredOffers] = useState([]); // oferty po filtracji
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(""); // data wybrana przez użytkownika (w formacie YYYY-MM-DD)
  
  // Używamy dużej wartości pageSize, aby pobrać wszystkie oferty w jednym wywołaniu
  const pageSize = 100;

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api-lockstep.berlin-opiekunki.pl/v1/offer/all",
          { params: { page: 1, pageSize } }
        );
        console.log("API response:", response.data);
        // Zakładamy strukturę: { meta: { all: totalCount }, offers: [...] }
        const { meta, offers: fetchedOffers } = response.data;
        const totalOffersCount = meta.all;
        const allOffers = fetchedOffers.slice(0, totalOffersCount);
        // Sortujemy oferty według daty rozpoczęcia (rosnąco)
        const sortedOffers = allOffers.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
        setOffers(sortedOffers);
        // Na początku wyświetlamy wszystkie oferty
        setFilteredOffers(sortedOffers);
      } catch (err) {
        console.error("Błąd pobierania ofert:", err);
        setError("Błąd pobierania ofert");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Funkcja filtrująca oferty według wprowadzonej daty
  const handleFilter = () => {
    if (!filterDate) {
      setFilteredOffers(offers);
      return;
    }
    // Konwertujemy wprowadzoną datę na obiekt Date
    const selectedDate = new Date(filterDate);
    // Filtrujemy oferty, które mają startDate większą lub równą wybranej dacie
    const filtered = offers.filter((offer) => {
      if (!offer.startDate) return false;
      return new Date(offer.startDate) >= selectedDate;
    });
    setFilteredOffers(filtered);
  };

  if (loading) return <div>Ładowanie ofert...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Oferty Pracy</h2>

      {/* Sekcja filtracji */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label style={{ marginRight: "10px" }}>
          Wybierz datę:
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ marginLeft: "5px" }}
          />
        </label>
        <button onClick={handleFilter}>Wyświetl oferty po dacie</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Tytuł</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Opis</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Miasto</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Kod</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Płeć</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left" }}>Data rozpoczęcia</th>
          </tr>
        </thead>
        <tbody>
          {filteredOffers.map((offer, index) => (
            <tr key={`${offer.name}-${index}`}>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{offer.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{offer.title}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{offer.description}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{offer.city}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{offer.code}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{offer.sex}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : "Brak daty"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OffersTable;