import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

export default function TabSendSms() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!phone) {
      toast.error('Podaj numer telefonu');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/send-sms`, {
        phone,
        message: 'Szczesliwej i bezpiecznej podrozy zyczy Berlin Opieka 24'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('SMS został wysłany');
      setPhone('');
    } catch (err) {
      console.error('Błąd wysyłania SMS:', err);
      toast.error('Nie udało się wysłać SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        Wyślij SMS: „Szczesliwej i bezpiecznej podrozy zyczy Berlin Opieka 24”
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="Numer telefonu (np. 577595055)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
            outlineColor: '#007bff'
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#28a745',
            color: '#fff',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Wysyłanie...' : 'Wyślij SMS'}
        </button>
      </div>
    </div>
  );
}