import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicFeedbackForm = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`);
        setData(res.data);
        setForm({
          q1: res.data.q1 || '',
          q2: res.data.q2 || '',
          q3: res.data.q3 || '',
          q4: res.data.q4 || '',
          q5: res.data.q5 || '',
          q6: res.data.q6 || '',
          q7: res.data.q7 || '',
          q8: res.data.q8 || '',
          q9: res.data.q9 || '',
          q10: res.data.q10 || '',
          notes: res.data.notes || '',
        });
      } catch (err) {
        setError('Nie znaleziono formularza lub wystąpił błąd.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`, form);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Wystąpił błąd podczas zapisu.');
    }
  };

  if (loading) return <p className="p-4">Ładowanie...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (success) return <p className="p-4 text-green-600">✅ Formularz został zapisany. Dziękujemy!</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Formularz oceny opiekunki</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={`q${i + 1}`}>
            <label className="block font-medium mb-1">Pytanie {i + 1}</label>
            <input
              type="text"
              name={`q${i + 1}`}
              value={form[`q${i + 1}`]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        ))}

        <div>
          <label className="block font-medium mb-1">Uwagi (opcjonalnie)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Wyślij
        </button>
      </form>
    </div>
  );
};

export default PublicFeedbackForm;