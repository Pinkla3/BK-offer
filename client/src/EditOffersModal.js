// EditOffersModal.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

const filterOffersByMonth = (offer, availability) => {
  if (!offer.startDate) return false;

  const [year, month] = availability.split("-");
  if (!year || !month) return false;

  const lowerBound = new Date(`${year}-${month}-01T00:00:00Z`);
  const nextMonth = (parseInt(month, 10) % 12) + 1;
  const nextYear = parseInt(month, 10) === 12 ? parseInt(year, 10) + 1 : year;
  const nextMonthStr = nextMonth < 10 ? "0" + nextMonth : nextMonth;
  const upperBound = new Date(`${nextYear}-${nextMonthStr}-01T00:00:00Z`);

  const offerDate = new Date(offer.startDate);
  return offerDate >= lowerBound && offerDate < upperBound;
};

const formatStartDate = (startDate) => {
  if (!startDate) return 'Brak daty';
  const date = new Date(startDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const EditOffersModal = ({ isOpen, onRequestClose, availability }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("https://api-lockstep.berlin-opiekunki.pl/v1/offer/all", {
          params: { page: 1, pageSize: 100 }
        });

        const { meta, offers: fetchedOffers } = response.data;
        const totalOffersCount = meta.all;
        const allOffers = fetchedOffers.slice(0, totalOffersCount);

        const filteredOffers = allOffers.filter((offer) =>
          filterOffersByMonth(offer, availability)
        );

        setOffers(filteredOffers);
      } catch (err) {
        console.error(err);
        setError("Błąd pobierania ofert");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && availability) {
      fetchOffers();
    }
  }, [isOpen, availability]);

  return (
    <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Oferty według dyspozycyjności w"
    style={{
      content: {
        maxWidth: "900px",
        margin: "auto",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        background: "#fff",
        zIndex: 10001,
        position: "relative" // ważne!
      },
      overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 10000,
        position: "fixed", // konieczne do przykrycia całego viewportu
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }
    }}
  >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Oferty pracy - dostępność w : {availability}
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
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Numer oferty</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data rozpoczęcia</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Miasto</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Kod języka</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Płeć</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <tr key={offer.uid || index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.name}</td>
             <td style={{ border: "1px solid #ddd", padding: "8px" }}>
  {offer.startDate ? formatStartDate(offer.startDate) : "Brak daty"}
</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.city}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.code}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{offer.sex}</td>
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