import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

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

const Row = styled.div`
  display: flex;
  gap: 10px;
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

const InputBase = ({ error, ...rest }) => <input {...rest} />;

const Input = styled(InputBase)`
  padding: 8px;
  font-size: 14px;
  border: 1px solid ${p => p.error ? '#e74c3c' : '#ccc'};
  border-radius: 4px;
`;

const TextAreaBase = ({ error, ...rest }) => <textarea {...rest} />;

const TextArea = styled(TextAreaBase)`
  padding: 8px;
  font-size: 14px;
  border: 1px solid ${p => p.error ? '#e74c3c' : '#ccc'};
  border-radius: 4px;
  resize: vertical;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  margin-top: 4px;
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

const OptionButton = styled(({ active, ...rest }) => <button {...rest} />)`
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

const TabFeedback = ({ onSuccess, onClose }) => {
const initialState = {
  caregiverFirstName: '',
  caregiverLastName: '',
  caregiverPhone: '',
  patientFirstName: '',
  patientLastName: '',
  q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q7_why: '',
  q8_plus: '', q8_minus: '', q9: '', q10: '', notes: ''
};
  const [formData, setFormData] = useState(initialState);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [sendingSms, setSendingSms] = useState(false);
  const [mode, setMode] = useState('form');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNext = e => {
    e.preventDefault();
    setStep(2); 
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/tabResponses`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 🔔 Komunikat sukcesu
      toast.success('Feedback dodany');
  
      // 🔁 Odśwież widok listy (jak fetchCases)
      window.dispatchEvent(new Event('feedbackBack'));
  
      // Reset + zamknięcie
      onSuccess?.(res.data); // możesz też usunąć to, jeśli już niepotrzebne
      onClose?.();
      setForm(initialState);
      setStep(1);
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas zapisu feedbacku');
    } finally {
      setSubmitting(false);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('goToFeedbackList'));
    }, 100);
  };
  const handleSendSms = async () => {
    const phone = form.caregiverPhone;
    if (!phone) {
      toast.error('Podaj numer telefonu');
      return;
    }
  
    try {
      setSendingSms(true);
      const token = localStorage.getItem('token');
  
      // 🔹 Najpierw zapisz wpis (ale tylko dane podstawowe, bez pytań)
      const res = await axios.post(`${API_BASE_URL}/api/tabResponses`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 🔹 Wyślij SMS tylko z linkiem, używając wygenerowanego ID
      await axios.post(`${API_BASE_URL}/api/send-sms-feedback-link`, {
        id: res.data.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      toast.success('SMS został wysłany!');
      onClose?.();
      setForm(initialState);
      setStep(1);
      setErrors({});
    } catch (err) {
      console.error('Błąd SMS:', err);
      toast.error('Nie udało się wysłać SMS-a');
    } finally {
      setSendingSms(false);
    }
  };

  
  return (
    <Wrapper>
      <Container>
        <Title>Formularz odpowiedzi</Title>
        {step === 1 ? (
          <Form onSubmit={handleNext}>
            <Row>
              <QuestionGroup>
                <Label>Imię opiekunki</Label>
                <Input
  name="caregiverFirstName"
  value={form.caregiverFirstName}
  onChange={handleChange}
/>
                {errors.caregiverFirstName && <ErrorText>{errors.caregiverFirstName}</ErrorText>}
              </QuestionGroup>
              <QuestionGroup>
                <Label>Nazwisko opiekunki</Label>
                <Input
                  name="caregiverLastName"
                  value={form.caregiverLastName}
                  onChange={handleChange}
                  error={!!errors.caregiverLastName}
                />
                {errors.caregiverLastName && <ErrorText>{errors.caregiverLastName}</ErrorText>}
              </QuestionGroup>
            </Row>
            <QuestionGroup>
              <Label>Numer telefonu opiekunki</Label>
              <Input
                name="caregiverPhone"
                type="tel"
                value={form.caregiverPhone}
                onChange={handleChange}
                error={!!errors.caregiverPhone}
              />
              {errors.caregiverPhone && <ErrorText>{errors.caregiverPhone}</ErrorText>}
            </QuestionGroup>
            <Row>
              <QuestionGroup>
                <Label>Imię pacjenta</Label>
                <Input
                  name="patientFirstName"
                  value={form.patientFirstName}
                  onChange={handleChange}
                  error={!!errors.patientFirstName}
                />
                {errors.patientFirstName && <ErrorText>{errors.patientFirstName}</ErrorText>}
              </QuestionGroup>
              <QuestionGroup>
                <Label>Nazwisko pacjenta</Label>
                <Input
                  name="patientLastName"
                  value={form.patientLastName}
                  onChange={handleChange}
                  error={!!errors.patientLastName}
                />
                {errors.patientLastName && <ErrorText>{errors.patientLastName}</ErrorText>}
              </QuestionGroup>
            </Row>
            <QuestionGroup>
  <Label>Wybierz sposób wypełnienia feedbacku:</Label>
  <div style={{ display: 'flex', gap: '12px' }}>
    <label>
      <input type="radio" value="form" checked={mode === 'form'} onChange={() => setMode('form')} />
      Wypełnij teraz
    </label>
    <label>
      <input type="radio" value="sms" checked={mode === 'sms'} onChange={() => setMode('sms')} />
      Wyślij SMS z linkiem
    </label>
  </div>
</QuestionGroup>
{mode === 'form' ? (
  <Button type="submit">Dalej</Button>
) : (
  <Button type="button" onClick={handleSendSms} disabled={sendingSms}>
    {sendingSms ? 'Wysyłanie...' : 'Wyślij SMS z linkiem'}
  </Button>
)}
          </Form>
        ) : (
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
    <span>inne trudności</span>
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
        )}
      </Container>
    </Wrapper>
  );
};

export default TabFeedback;