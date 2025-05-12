import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

// Reużyte style z TabFeedback
const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url('/images/background.jfif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  align-items: flex-start;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 4px;
    text-align: left;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  width: 100%;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  align-self: center;
  width: fit-content;
  transition: background 0.2s;
  &:hover {
    background-color: #0056b3;
  }
`;

const questions = [
  '1. Jak ogólnie czuje się pan/pani z pacjentem/pacjentką?',
  '2. Jak został/została pan/pani przyjęta przez pacjenta/pacjentkę?',
  '3. Jak wygląda współpraca z członkami rodziny?',
  '4. Czy istnieją trudności w opiece nad pacjentem/pacjentką?',
  '5. Czy dyżuruje służba pielęgniarska (Pflegedienst)?',
  '6. Czy są przerwy i czas wolny?',
  '7. Czy wszystko jest dobrze zorganizowane w kwesti budżetu domowego, planu dnia itd. ?',
  '8. Czy chciałby pan/pani wrócić? Jeśli tak, w jakim rytmie? Jeśli nie, dlaczego nie?',
  '9. W jaki sposób aktywizuje pan/pani pacjenta/pacjentkę?',
  '10. Czy jest coś, co rodzina pacjenta/pacjentki lub firma Berlin Opieka 24 może zoptymalizować?'
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
        const res = await axios.get(`${API_BASE_URL}/api/public-feedback/${token}`);
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
      } catch (err) {
        if (err.response && err.response.status === 410) {
          setError(<div
            style={{
              minHeight: '100vh',
              backgroundImage: 'url("/images/background.jfif")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgb(255, 255, 255)',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <a href="https://berlin-opiekunki.pl" target="_blank" rel="noopener noreferrer">
                <img
                  src="/images/logo.jpg"
                  alt="Logo Berlin Opiekunek"
                  style={{ maxWidth: '160px', marginBottom: '1.5rem' }}
                />
              </a>
              <h2 style={{ fontSize: '2rem', color: '#FF0000', marginBottom: '1rem' }}>⚠️ Link wygasł.</h2>
              <p> Prosimy o kontakt z koordynatorem.</p>
            </div>
          </div>);
        } else {
          setError(<div
            style={{
              minHeight: '100vh',
              backgroundImage: 'url("/images/background.jfif")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgb(255, 255, 255)',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <a href="https://berlin-opiekunki.pl" target="_blank" rel="noopener noreferrer">
                <img
                  src="/images/logo.jpg"
                  alt="Logo Berlin Opiekunek"
                  style={{ maxWidth: '160px', marginBottom: '1.5rem' }}
                />
              </a>
              <h2 style={{ fontSize: '2rem', color: '#FF0000', marginBottom: '1rem' }}>❌ Nie znaleziono formularza lub wystąpił błąd.</h2>
              <p> Prosimy o kontakt.</p>
            </div>
          </div>);
        }
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
      await axios.patch(`${API_BASE_URL}/api/public-feedback/${token}`, form);
      await axios.post(`${API_BASE_URLL}/api/send-feedback-notification`);
      setSuccess(true);
      window.dispatchEvent(new Event('feedbackUpdated')); // 🔔 informuj panel admina
    } catch (err) {
      console.error(err);
      setError('❌ Błąd podczas zapisu formularza.');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Ładowanie...</p>;
  if (error) return error;
  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundImage: 'url("/images/background.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <a href="https://berlin-opiekunki.pl" target="_blank" rel="noopener noreferrer">
            <img
              src="/images/logo.jpg"
              alt="Logo Berlin Opiekunek"
              style={{ maxWidth: '160px', marginBottom: '1.5rem' }}
            />
          </a>
          <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '1rem' }}>✅ Gotowe!</h2>
          <p style={{ fontSize: '1.2rem', color: '#2c3e50' }}>
            Dziękujemy za wypełnienie formularza. 
          </p>
          <p>W przypadku zmian prosimy o kontakt z koordynatorem.</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper>
      <div
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
      <Container>
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <a href="https://berlin-opiekunki.pl" target="_blank" rel="noopener noreferrer">
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
      </div>
    </Wrapper>
  );
};

export default PublicFeedbackForm;