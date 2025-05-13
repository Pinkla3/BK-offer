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
const OptionButton = styled(Button)`
  margin-top: 0;
  padding: 10px 20px;
  width: 100%;
  max-width: 300px;
  background-color: ${props => (props.active ? '#007bff' : '#f0f0f0')};
  color: ${props => (props.active ? '#fff' : '#333')};
  border: 1px solid ${props => (props.active ? '#007bff' : '#ccc')};
  box-shadow: ${props => (props.active ? '0 0 6px rgba(0, 123, 255, 0.3)' : 'none')};
  &:hover {
    background-color: ${props => (props.active ? '#0056b3' : '#e0e0e0')};
  }
`;

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
        q3: res.data.q3 || [],
        q4: res.data.q4 || '',
        q5: res.data.q5 || '',
        q6: res.data.q6 || '',
        q7: res.data.q7 || '',
        q7_why: res.data.q7_why || '',
        q8_plus: res.data.q8_plus || '',
        q8_minus: res.data.q8_minus || '',
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
      await axios.post(`${API_BASE_URL}/api/send-feedback-notification`);
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
<QuestionGroup>
  <Label>1. Jak ogólnie czuje się Pani/Pan z klientem?</Label>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
      gap: '16px',
      justifyContent: 'center',
      marginTop: '12px',
      width: '100%',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}
  >
    {['bardzo dobrze', 'dobrze', 'średnio', 'mam zastrzeżenia'].map(val => (
      <OptionButton
        key={val}
        type="button"
        active={form.q1 === val}
        onClick={() => setForm(prev => ({ ...prev, q1: val }))}
      >
        {val}
      </OptionButton>
    ))}
  </div>

  {/* Pole tekstowe z animacją jak w pytaniu 5 */}
  <div
    style={{
      marginTop: '16px',
      overflow: 'hidden',
      maxHeight: form.q1 === 'średnio' || form.q1 === 'mam zastrzeżenia' ? '200px' : '0px',
      opacity: form.q1 === 'średnio' || form.q1 === 'mam zastrzeżenia' ? 1 : 0,
      transition: 'all 0.4s ease',
      width: '100%'
    }}
  >
    <TextArea
      name="q2"
      value={form.q2}
      onChange={handleChange}
      placeholder="Dlaczego?"
      rows={3}
      style={{
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        boxSizing: 'border-box',
        transition: 'opacity 0.3s ease',
        resize: 'vertical',
        backgroundColor: '#fff',
      }}
    />
  </div>
</QuestionGroup>

{/* Pytanie 2 */}
<QuestionGroup>
  <Label>2. Czy istnieją trudności w opiece nad pacjentem/pacjentką?</Label>
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '250px 1fr', // lewa stała, prawa elastyczna
    columnGap: '30px',
    rowGap: '12px',
    marginTop: '10px',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }}
>
  {/* Standardowe checkboxy */}
  {['występują nocki', 'osoba jest trudna', 'jest ciężki transfer', 'brak'].map(option => {
    const isChecked = form.q3?.includes(option);
    return (
      <label
        key={option}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '16px',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {
            const list = form.q3 || [];
            const updated = isChecked
              ? list.filter(i => i !== option)
              : [...list, option];
            setForm(prev => ({ ...prev, q3: updated }));
          }}
          style={{
            width: '20px',
            height: '20px',
            accentColor: '#007bff'
          }}
        />
        <span>{option}</span>
      </label>
    );
  })}

  {/* Checkbox "Inne trudności" */}
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '16px',
      cursor: 'pointer',
      userSelect: 'none',
      whiteSpace: 'nowrap'
    }}
  >
    <input
      type="checkbox"
      checked={form.q3?.includes('inne trudności')}
      onChange={() => {
        const list = form.q3 || [];
        const updated = form.q3?.includes('inne trudności')
          ? list.filter(i => i !== 'inne trudności')
          : [...list, 'inne trudności'];
        setForm(prev => ({ ...prev, q3: updated }));
      }}
      style={{
        width: '20px',
        height: '20px',
        accentColor: '#007bff'
      }}
    />
    <span>Inne trudności</span>
  </label>

  {/* Kolumna 2: input pojawia się tylko jeśli zaznaczono */}
<Input
  type="text"
  name="q4"
  placeholder="Proszę podać szczegóły"
  value={form.q4}
  onChange={handleChange}
  style={{
    width: '100%',
    maxWidth: '300px',
    visibility: form.q3?.includes('inne trudności') ? 'visible' : 'hidden',
    pointerEvents: form.q3?.includes('inne trudności') ? 'auto' : 'none',
  }}
/>
</div>
</QuestionGroup>

 {/* Pytanie 3 */}
<QuestionGroup>
  <Label>3. Czy ma Pani/Pan czas wolny?</Label>
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
          columnGap: '120px',
    rowGap: '12px',
      justifyContent: 'center',
      marginTop: '12px',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}
  >
    {['Tak', 'Nie'].map(val => (
      <OptionButton
        key={val}
        type="button"
        active={form.q5 === val}
        onClick={() => setForm(prev => ({ ...prev, q5: val }))}
      >
        {val}
      </OptionButton>
    ))}
  </div>
</QuestionGroup>

<QuestionGroup>
  <Label style={{ textAlign: 'left', width: '100%' }}>
    4. Ile wynosi budżet na tydzień? (w Euro)
  </Label>

  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: '12px',
      width: '100%'
    }}
  >
    <div
      style={{
        position: 'relative',
        maxWidth: '220px', // większa szerokość pola
        width: '100%'
      }}
    >
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        name="q6"
        value={form.q6}
        onChange={handleChange}
        placeholder="np. 50"
        style={{
          paddingRight: '28px',
          paddingTop: '14px',
          paddingBottom: '14px',
          textAlign: 'center',
          fontSize: '18px',          // większy tekst
          height: '48px',            // większa wysokość
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          width: '100%'
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontWeight: 'bold',
          fontSize: '16px',
          pointerEvents: 'none',
          color: '#333'
        }}
      >
        €
      </span>
    </div>
  </div>
</QuestionGroup>

  {/* Pytanie 5 */}
<QuestionGroup>
  <Label>5. Czy chciałabyś wrócić do rodziny?</Label>
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
                columnGap: '120px',
    rowGap: '12px',
      justifyContent: 'center',
      marginTop: '12px',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}
  >
    {['Tak', 'Nie'].map(val => (
      <OptionButton
        key={val}
        type="button"
        active={form.q7 === val}
        onClick={() => setForm(prev => ({ ...prev, q7: val }))}
      >
        {val}
      </OptionButton>
    ))}
  </div>
<div
  style={{
    marginTop: '16px',
    overflow: 'hidden',
    maxHeight: form.q7 === 'Nie' ? '200px' : '0px',
    opacity: form.q7 === 'Nie' ? 1 : 0,
    transition: 'all 0.4s ease',
    width: '100%'
  }}
>
  <TextArea
    name="q7_why"
    value={form.q7_why || ''}
    onChange={handleChange}
    placeholder="Dlaczego nie?"
    rows={3}
    style={{
      width: '100%',
      border: '1px solid #ccc',     // ramka
      borderRadius: '8px',          // lekko zaokrąglone rogi
      padding: '10px',              // komfortowy padding
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'opacity 0.3s ease',
      resize: 'vertical',
      backgroundColor: '#fff',
    }}
  />
</div>

</QuestionGroup>

 <QuestionGroup>
  <Label style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
    6. Napisz 2 plusy:
  </Label>

  <TextArea
    name="q8_plus"
    value={form.q8_plus || ''}
    onChange={handleChange}
    rows={2}
    placeholder="Np. dobra atmosfera, wsparcie rodziny..."
    style={{
      width: '100%',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      resize: 'vertical',
      boxSizing: 'border-box',
      marginBottom: '16px',
    }}
  />

  <Label style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
    ...i 2 minusy zlecenia (jeśli są):
  </Label>

  <TextArea
    name="q8_minus"
    value={form.q8_minus || ''}
    onChange={handleChange}
    rows={2}
    placeholder="Np. brak czasu wolnego, trudna komunikacja..."
    style={{
      width: '100%',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      resize: 'vertical',
      boxSizing: 'border-box'
    }}
  />
</QuestionGroup>
          <QuestionGroup>
  <Label style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
    Notatka
  </Label>
  <TextArea
    name="notes"
    value={form.notes}
    onChange={handleChange}
    rows={4}
    placeholder="Tutaj możesz wpisać dodatkowe uwagi, komentarze, spostrzeżenia..."
    style={{
      width: '100%',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      resize: 'vertical',
      boxSizing: 'border-box',
      backgroundColor: '#fff'
    }}
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