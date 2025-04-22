// EditOffersModal.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

const filterOffersAfterDate = (offer, availability) => {
  if (!offer.startDate || !availability) return false;
  const offerDate = new Date(offer.startDate);
  const availDate = new Date(availability);
  // uwzględniamy oferty od tej daty wzwyż
  return offerDate >= availDate;
};

const formatStartDate = (startDate) => {
  if (!startDate) return 'Brak daty';
  const date = new Date(startDate);
  const day   = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year  = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const EditOffersModal = ({ isOpen, onRequestClose, availability }) => {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await axios.get(
          "https://api-lockstep.berlin-opiekunki.pl/v1/offer/all",
          { params: { page: 1, pageSize: 100 } }
        );
        const { meta, offers: fetched } = resp.data;
        const all = fetched.slice(0, meta.all);
        // teraz filtrujemy po dacie >= availability
        setOffers(all.filter(o => filterOffersAfterDate(o, availability)));
      } catch (err) {
        console.error(err);
        setError("Błąd pobierania ofert");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && availability) fetchOffers();
  }, [isOpen, availability]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Oferty według dyspozycyjności"
      style={{
        content: {
          maxWidth: "900px",
          margin: "auto",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "#fff",
          zIndex: 10001,
          position: "relative"
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Oferty pracy od: {formatStartDate(availability)}
      </h2>

      {loading && <div>Ładowanie ofert...</div>}
      {error   && <div>{error}</div>}
      {!loading && !error && offers.length === 0 && (
        <div>Brak ofert pracy od wybranej daty.</div>
      )}

      {!loading && !error && offers.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={thStyle}>Numer oferty</th>
              <th style={thStyle}>Data rozpoczęcia</th>
              <th style={thStyle}>Miasto</th>
              <th style={thStyle}>Kod języka</th>
              <th style={thStyle}>Płeć</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, i) => (
              <tr key={offer.uid || i}>
                <td style={tdStyle}>{offer.name}</td>
                <td style={tdStyle}>{formatStartDate(offer.startDate)}</td>
                <td style={tdStyle}>{offer.city}</td>
                <td style={tdStyle}>{offer.code}</td>
                <td style={tdStyle}>{offer.sex}</td>
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

const thStyle = { border: "1px solid #ddd", padding: "8px" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };

export default EditOffersModal;