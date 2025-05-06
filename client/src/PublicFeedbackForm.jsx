import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

// Reużyte style z TabFeedback
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Container = styled.div`
  padding: 5px;
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 2;
  border-radius: 12px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  text-align: center;
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-top: 0;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestionGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background .2s;
  &:hover { background: #0056b3; }
`;

const questions = [
  '1. Jak BK ogólnie czuje się z klientem?',
  '2. Jak została przyjęta przez pacjenta?',
  '3. Jak wygląda współpraca z członkami rodziny?',
  '4. Czy istnieją trudności w opiece nad pacjentem/pacjentką?',
  '5. Czy dyżuruje służba pielęgniarska (Pflegedienst)?',
  '6. Czy BK ma przerwy i czas wolny?',
  '7. Czy wszystko jest dobrze zorganizowane?',
  '8. Czy BK chciałby wrócić? Jeśli tak, w jakim rytmie? Jeśli nie, dlaczego nie?',
  '9. W jaki sposób aktywizujesz seniora?',
  '10. Czy jest coś, co klient lub firma Berlin Opieka może zoptymalizować?'
];

const PublicFeedbackForm = () => {
  const { token } = useParams();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`);
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
          notes: res.data.notes || ''
        });
      } catch {
        setError('❌ Nie znaleziono formularza lub wystąpił błąd.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/public-feedback/${token}`, form);
      setSuccess(true);
      window.dispatchEvent(new Event('feedbackUpdated')); // 🔔 informuj panel admina
    } catch (err) {
      console.error(err);
      setError('❌ Błąd podczas zapisu formularza.');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Ładowanie...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #e0f2ff, #cce4f6)', // jasnoniebieski gradient
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <a href="https://berlin-opiekunk.pl" target="_blank" rel="noopener noreferrer">
          <img
            src="/images/logo"
            alt="Logo Berlin Opiekunek"
            style={{ maxWidth: '160px', marginBottom: '2rem' }}
          />
        </a>
        <h2 style={{ fontSize: '2rem', color: '#1a73e8', marginBottom: '1rem' }}>✅ Gotowe!</h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', color: '#2c3e50' }}>
          Dziękujemy za wypełnienie formularza. W przypadku zmian prosimy o kontakt z koordynatorem.
        </p>
      </div>
    );
  }

  return (
    <Wrapper>
      <Container>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <a href="https://berlin-opiekunk.pl" target="_blank" rel="noopener noreferrer">
      <img
        src="/images/logo.jpg" // lub własna ścieżka
        alt="Logo Berlin Opiekunek"
        style={{ maxWidth: '160px', marginBottom: '2rem' }}
      />
    </a>
    </div>
        <Title>Formularz opinii</Title>
        <Form onSubmit={handleSubmit}>
          {questions.map((q, i) => (
            <QuestionGroup key={i}>
              <Label>{q}</Label>
              {i === 4 ? (
                <Input name={`q${i + 1}`} value={form[`q${i + 1}`]} onChange={handleChange} />
              ) : (
                <TextArea name={`q${i + 1}`} value={form[`q${i + 1}`]} onChange={handleChange} rows={3} />
              )}
            </QuestionGroup>
          ))}
          <QuestionGroup>
            <Label>Notatka (opcjonalnie)</Label>
            <TextArea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Wygląd okolicy, warunki mieszkalne, inne pozytywy"
            />
          </QuestionGroup>
          <Button type="submit">Zapisz odpowiedzi</Button>
        </Form>
      </Container>
    </Wrapper>
  );
};

export default PublicFeedbackForm;