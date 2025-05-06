import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Textarea = styled.textarea`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: vertical;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: #1669c1;
  }
`;

const PublicFeedbackForm = () => {
  const [form, setForm] = useState({});
  const [token, setToken] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const questions = [
    'Czy opiekunka była punktualna i zorganizowana?',
    'Czy opiekunka miała dobre relacje z podopiecznym?',
    'Czy opiekunka utrzymywała czystość w domu?',
    'Czy opiekunka dbała o higienę podopiecznego?',
    'Czy opiekunka przygotowywała posiłki zgodnie z wymaganiami?',
    'Czy opiekunka była pomocna i uprzejma?',
    'Czy opiekunka informowała rodzinę o stanie podopiecznego?',
    'Czy opiekunka radziła sobie w trudnych sytuacjach?',
    'Czy opiekunka była komunikatywna?',
    'Czy ogólnie jesteście Państwo zadowoleni z pracy opiekunki?'
  ];

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const tokenFromUrl = parts[parts.length - 1];
    setToken(tokenFromUrl);

    axios.get(`${process.env.REACT_APP_API_URL}/api/public-feedback/${tokenFromUrl}`)
      .then(res => {
        setForm(res.data || {});
        setLoading(false);
      })
      .catch(() => {
        setError('Nie znaleziono formularza lub wystąpił błąd.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`, form);
      setSuccess(true);
      window.dispatchEvent(new Event('feedbackUpdated'));
    } catch (err) {
      setError('Wystąpił błąd podczas zapisu formularza.');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Ładowanie...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  if (success) {
    return (
      <div style={{
        backgroundImage: 'url("/images/background.jfif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          background: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <a href="https://berlin-opiekunk.pl" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo" alt="Logo" style={{ maxWidth: '160px', marginBottom: '2rem' }} />
          </a>
          <h2 style={{ color: '#1a73e8' }}>✅ Gotowe!</h2>
          <p>Dziękujemy za wypełnienie formularza. W przypadku zmian prosimy o kontakt z koordynatorem.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundImage: 'url("/images/background.jfif")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        background: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <a href="https://berlin-opiekunk.pl" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo" alt="Logo" style={{ maxWidth: '160px' }} />
          </a>
        </div>
        <Title>Formularz opinii</Title>
        <Form onSubmit={handleSubmit}>
          {questions.map((question, i) => (
            <div key={i}>
              <label>{question}</label>
              <Textarea
                name={`q${i + 1}`}
                value={form[`q${i + 1}`] || ''}
                onChange={handleChange}
                rows="3"
              />
            </div>
          ))}

          <label>Uwagi</label>
          <Textarea name="notes" value={form.notes || ''} onChange={handleChange} rows="4" />

          <Button type="submit">Zapisz odpowiedzi</Button>
        </Form>
      </div>
    </div>
  );
};

export default PublicFeedbackForm;