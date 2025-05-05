import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PublicFeedbackForm = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`);
        setFormData(res.data);
      } catch (err) {
        toast.error('Nie udało się pobrać formularza');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`, formData);
      toast.success('Formularz został zapisany!');
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas zapisu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Ładowanie formularza...</p>;
  if (!formData) return <p>Nie znaleziono formularza.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Formularz Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="caregiver_first_name"
          value={formData.caregiver_first_name || ''}
          onChange={handleChange}
          placeholder="Imię opiekunki"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="caregiver_last_name"
          value={formData.caregiver_last_name || ''}
          onChange={handleChange}
          placeholder="Nazwisko opiekunki"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="caregiver_phone"
          value={formData.caregiver_phone || ''}
          onChange={handleChange}
          placeholder="Telefon"
          className="w-full p-2 border rounded"
        />

        {[...Array(10)].map((_, i) => (
          <textarea
            key={i}
            name={`q${i + 1}`}
            value={formData[`q${i + 1}`] || ''}
            onChange={handleChange}
            placeholder={`Pytanie ${i + 1}`}
            className="w-full p-2 border rounded"
            rows={3}
          />
        ))}

        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Uwagi / komentarz"
          className="w-full p-2 border rounded"
          rows={4}
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {saving ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </form>
    </div>
  );
};

export default PublicFeedbackForm;