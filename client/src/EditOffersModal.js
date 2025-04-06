// EditOffersModal.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

// Funkcja filtrująca oferty według wybranej dyspozycyjności w formacie "YYYY-MM"
const filterOffersByMonth = (offer, availability) => {
  if (!offer.startDate) return false;
  const [year, month] = availability.split("-");
  if (!year || !month) return false;
  
  // Ustal dolny próg: pierwszy dzień wybranego miesiąca
  const lowerBound = new Date(`${year}-${month}-01T00:00:00Z`);
  // Oblicz górny próg: pierwszy dzień następnego miesiąca
  const nextMonth = (parseInt(month, 10) % 12) + 1;
  const nextYear = parseInt(month, 10) === 12 ? parseInt(year, 10) + 1 : year;
  const nextMonthStr = nextMonth < 10 ? "0" + nextMonth : nextMonth;
  const upperBound = new Date(`${nextYear}-${nextMonthStr}-01T00:00:00Z`);

  const offerDate = new Date(offer.startDate);
  // Oferta jest uwzględniana, jeśli startDate mieści się w przedziale [lowerBound, upperBound)
  return offerDate >= lowerBound && offerDate < upperBound;
};

const EditOffersModal = ({ isOpen, onRequestClose, availability }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchOffers = async () => {
        setLoading(true);
        try {
          // Pobieramy wszystkie oferty – ustawiamy duży pageSize, aby mieć wszystkie wpisy
          const response = await axios.get("https://api-lockstep.berlin-opiekunki.pl/v1/offer/all", {
            params: { page: 1, pageSize: 100 }
          });
          console.log("EditOffersModal - API response:", response.data);
          const { meta, offers: fetchedOffers } = response.data;
          const totalOffersCount = meta.all;
          const allOffers = fetchedOffers.slice(0, totalOffersCount);
          console.log("All offers (raw):", allOffers);

          // Debug: wypisz dla każdej oferty wartość startDate oraz obliczoną dyspozycyjność
          allOffers.forEach((offer, idx) => {
            console.log(`Offer ${idx} startDate:`, offer.startDate);
            const filteredValue = filterOffersByMonth(offer, availability);
            console.log(`Offer ${idx} meets availability (${availability}):`, filteredValue);
          });

          // Filtrujemy oferty – wybieramy tylko te, których startDate mieści się w wybranym miesiącu
          const filteredOffers = allOffers.filter((offer) =>
            filterOffersByMonth(offer, availability)
          );
          console.log("Filtered offers (availability:", availability, "):", filteredOffers);
          setOffers(filteredOffers);
        } catch (err) {
          console.error("EditOffersModal - Błąd pobierania ofert:", err);
          setError("Błąd pobierania ofert");
        } finally {
          setLoading(false);
        }
      };

      fetchOffers();
    }
  }, [isOpen, availability]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Oferty według dyspozycyjności"
      style={{
        content: {
          maxWidth: "600px",
          margin: "auto",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "#fff"
        }
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Oferty pracy - dostępność: {availability}
      </h2>
      {loading && <div>Ładowanie ofert...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && offers.length === 0 && (
        <div>Brak ofert pracy dla wybranej dyspozycyjności.</div>
      )}
      {!loading && !error && offers.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tytuł</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Miasto</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data rozpoczęcia</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <tr key={offer.id || index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.title}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.city}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : "Brak daty"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={onRequestClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Zamknij
        </button>
      </div>
    </Modal>
  );
};

export default EditOffersModal;