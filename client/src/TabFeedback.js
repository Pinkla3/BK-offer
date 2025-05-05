import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';

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

const questions = [
  '1. Jak BK ogólnie czuje się z klientem?',
  '2. Jak została przyjęta przez pacjenta?',
  '3. Jak wygląda współpraca z członkami rodziny?',
  '4. Czy istnieją trudności w opiece nad pacjentem/pacjentką? (czy występują noce, transfer, inkontynencja, forma poruszania się)',
  '5. Czy dyżuruje służba pielęgniarska (Pflegedienst)?',
  '6. Czy BK ma przerwy i czas wolny?',
  '7. Czy wszystko jest dobrze zorganizowane (budżet domowy, osoba kontaktowa dostępna, produkty pielęgnacyjne na miejscu, wsparcie przy zakupach hurtowych, czy przestrzegane są warunki pracy)?',
  '8. Czy BK chciałby wrócić? Jeśli tak, w jakim rytmie? Jeśli nie, dlaczego nie? Jak wygląda rytm dnia.',
  '9. W jaki sposób aktywizujesz seniora? Jakie są zainteresowania seniora?',
  '10. Czy jest coś, co klient lub firma Berlin Opieka może zoptymalizować?'
];

const TabFeedback = ({ onSuccess, onClose }) => {
  const initialState = {
    caregiverFirstName: '',
    caregiverLastName: '',
    caregiverPhone: '',
    patientFirstName: '',
    patientLastName: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', notes: ''
  };
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [sendingSms, setSendingSms] = useState(false);
  const [mode, setMode] = useState('form');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/tabResponses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 🔔 Komunikat sukcesu
      toast.success('Feedback dodany');
  
      // 🔁 Odśwież widok listy (jak fetchCases)
      window.dispatchEvent(new Event('feedbackBack'));
  
      // Reset + zamknięcie
      onSuccess?.(res.data); // możesz też usunąć to, jeśli już niepotrzebne
      onClose?.();
      setFormData(initialState);
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
    const phone = formData.caregiverPhone;
    if (!phone) {
      toast.error('Podaj numer telefonu');
      return;
    }
  
    try {
      setSendingSms(true);
      const token = localStorage.getItem('token');
  
      // 🔹 Najpierw zapisz wpis (ale tylko dane podstawowe, bez pytań)
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/tabResponses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 🔹 Wyślij SMS tylko z linkiem, używając wygenerowanego ID
      await axios.post(`${process.env.REACT_APP_API_URL}/api/send-sms-feedback-link`, {
        id: res.data.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      toast.success('SMS został wysłany!');
      onClose?.();
      setFormData(initialState);
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
  value={formData.caregiverFirstName}
  onChange={handleChange}
/>
                {errors.caregiverFirstName && <ErrorText>{errors.caregiverFirstName}</ErrorText>}
              </QuestionGroup>
              <QuestionGroup>
                <Label>Nazwisko opiekunki</Label>
                <Input
                  name="caregiverLastName"
                  value={formData.caregiverLastName}
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
                value={formData.caregiverPhone}
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
                  value={formData.patientFirstName}
                  onChange={handleChange}
                  error={!!errors.patientFirstName}
                />
                {errors.patientFirstName && <ErrorText>{errors.patientFirstName}</ErrorText>}
              </QuestionGroup>
              <QuestionGroup>
                <Label>Nazwisko pacjenta</Label>
                <Input
                  name="patientLastName"
                  value={formData.patientLastName}
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
            {questions.map((text, idx) => {
              const key = `q${idx + 1}`;
              return (
                <QuestionGroup key={key}>
                  <Label>{text}</Label>
                  {key === 'q5' ? (
                    <Input name={key} value={formData[key]} onChange={handleChange} />
                  ) : (
                    <TextArea name={key} value={formData[key]} onChange={handleChange} rows={3} />
                  )}
                </QuestionGroup>
              );
            })}
            <QuestionGroup>
              <Label>Notatka:</Label>
              <TextArea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Wygląd okolicy, warunki mieszkalne, inne pozytywy"
              />
            </QuestionGroup>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Zapisuję...' : 'Zapisz odpowiedzi'}
            </Button>
          </Form>
        )}
      </Container>
    </Wrapper>
  );
};

export default TabFeedback;