import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaSave, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import Modal from 'react-modal';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

const Wrapper = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #007bff;
  margin: 0;
`;

const TopInfoRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;


const Button = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;
  &:hover { background: #0056b3; }
  &:disabled { background: #999; cursor: not-allowed; }
`;

const DetailCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 32px;
  margin-top: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 12px;
  color: #007bff;
  font-size: 18px;
`;

const CenteredSectionTitle = styled(SectionTitle)`
  text-align: center;
    font-size: 22px;
`;

const QuestionGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 8px;
`;

const OptionButton = styled.button`
  background-color: ${props => (props.active ? '#007bff' : '#f0f0f0')};
  color: ${props => (props.active ? '#fff' : '#333')};
  border: 1px solid ${props => (props.active ? '#007bff' : '#ccc')};
  box-shadow: ${props => (props.active ? '0 0 6px rgba(0, 123, 255, 0.3)' : 'none')};
  padding: 10px 20px;
  border-radius: 8px;
  cursor: default;
  margin: 4px 0;
  width: 100%;
  max-width: 300px;
`;

const TextArea = styled('textarea')`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
nin-height: 60px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const FieldCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  }
`;

const FieldItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; /* odstęp między nazwą a wartością */
  margin-bottom: 8px;
`;

const FieldName = styled.div`
  font-weight: 600;
  color: #333;
  min-width: 140px; /* stała szerokość etykiety */
`;

const FieldValue = styled.div`
  color: #555;
  font-size: 16px;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
`;

const QuestionList = styled.div`
  background: #fafafa;
  border-radius: 8px;
`;

const QuestionItem = styled.div`
  border-left: 4px solid #007bff;
  padding: 12px;
`;

const QuestionText = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
`;

const AnswerText = styled.div`
  color: #555;
`;

const TabSection = styled.div`
  margin-bottom: 24px;
  background: #ffffff;
`;

const TabsBar = styled.div`
  display: flex;
  background: #f7f7f7;
`;

const TabButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'active'
  })`
    flex: 1;
    background: ${props => props.active ? '#007bff' : '#e6f7ff'};
    color: ${props => props.active ? '#ffffff' : '#007bff'};
    padding: 12px 0;
    text-align: center;
    cursor: pointer;
    font-size: 16px;
    border-radius: 0;
    
    &:hover {
      background: ${props => props.active ? '#0056b3' : '#d0e7ff'};
    }
    &:disabled {
      background: #999;
      color: #ffffff;
      cursor: not-allowed;
    }
  `;



const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
`;

const SmallButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  &:disabled {
    background: #ccc;
    color: #666;
    cursor: not-allowed;
  }

  &:disabled svg {
    transform: none;
  }
`;
const SmallButtonRefresh = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(90deg); /* 💫 obrót ikony */
  }

  &:disabled {
    background: #ccc;
    color: #666;
    cursor: not-allowed;
  }

  &:disabled svg {
    transform: none;
  }
`;
const SpinnerIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  opacity: 0.8;

  @keyframes spin {
    0% { transform: rotate(0deg); opacity: 0.8; }
    100% { transform: rotate(360deg); opacity: 1; }
  }
`;

const LeftButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Questions
const questionsPl = [
  '1. Jak BK ogólnie czuje się z klientem?',
  '2. Jak została przyjęta przez pacjenta?',
  '3. Jak wygląda współpraca z członkami rodziny?',
  '4. Czy istnieją trudności w opiece nad pacjentem/pacjentką? (noce, transfer, inkontynencja, forma poruszania się)',
  '5. Czy dyżuruje służba pielęgniarska (Pflegedienst)?',
  '6. Czy BK ma przerwy i czas wolny?',
  '7. Czy wszystko jest dobrze zorganizowane (budżet domowy, osoba kontaktowa, produkty pielęgnacyjne, wsparcie przy zakupach, warunki pracy)?',
  '8. Czy BK chciałby wrócić? Jeśli tak, w jakim rytmie? Jeśli nie, dlaczego nie? Jak wygląda rytm dnia.',
  '9. Jak aktywizujesz seniora? Jakie są zainteresowania seniora?',
  '10. Czy jest coś, co klient lub firma Berlin Opieka może zoptymalizować?'
];
const questionsDe = [
  '1. Wie steht BK generell zum Kunden?',
  '2. Wie wurde es von der Patientin aufgenommen?',
  '3. Wie ist die Zusammenarbeit mit den Familienangehörigen?',
  '4. Gibt es Schwierigkeiten bei der Pflege des Patienten/der Patientin? (Nächte, Transfer, Inkontinenz, Mobilität)',
  '5. Ist ein Pflegedienst im Einsatz?',
  '6. Hat BK Pausen und freie Zeit?',
  '7. Ist alles gut organisiert (Haushaltskasse, Ansprechpartner, Pflegemittel, Unterstützung, Arbeitsbedingungen)?',
  '8. Würde BK gerne wiederkommen? Wenn ja, in welchem Rhythmus? Wenn nein, warum nicht? Wie ist der Tagesrhythmus?',
  '9. Wie aktivieren Sie den Senior? Was sind die Interessen des Seniors?',
  '10. Gibt es etwas, was der Kunde oder Berlin Care optimieren kann?'
];
const noteLabelPl = 'Notatka:';
const noteLabelDe = 'Anmerkung:';

const TabFeedbackDetails = ({ selected, setSelected, onBack }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [showGerman, setShowGerman] = useState(false);
  const [germanAnswers, setGermanAnswers] = useState([]);
  const [translatedNote, setTranslatedNote] = useState('');
  const [translating, setTranslating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState([]);
  const [editedAnswersDe, setEditedAnswersDe] = useState([]);
  const [editedNote, setEditedNote] = useState('');
  const [editedNoteDe, setEditedNoteDe] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [isPolishChangedSinceTranslation, setIsPolishChangedSinceTranslation] = useState(false);
  const [editedCaregiverFirstName, setEditedCaregiverFirstName] = useState('');
  const [editedCaregiverLastName, setEditedCaregiverLastName] = useState('');
  const [editedCaregiverPhone, setEditedCaregiverPhone] = useState('');
  const [editedPatientFirstName, setEditedPatientFirstName] = useState('');
  const [editedPatientLastName, setEditedPatientLastName] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {

    const handleFeedbackBack = () => {
      setStep(1);
      setSelected(null);
    };
  
    window.addEventListener('feedbackBack', handleFeedbackBack);
  
    return () => {
      window.removeEventListener('feedbackBack', handleFeedbackBack);
    };
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/tabResponses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => { setResponses(res.data); setLoading(false); })
    .catch(() => { setError('Błąd pobierania danych'); setLoading(false); });
  }, []);

  const handleBack = () => {
    if (editing) {
      setEditing(false);
    } else {
      onBack(); // wywołuje setSelected(null)
    }
  };

  const initEdit = () => {
    const plTexts = questionsPl.map((_, i) => selected[`q${i+1}`] || '');
    const deTexts = (germanAnswers.length > 0)
      ? germanAnswers
      : questionsPl.map((_, i) => selected[`q${i+1}_de`] || '');

    setEditedAnswers(plTexts);
    setEditedAnswersDe(deTexts);
    setEditedNote(selected.notes || '');
    setEditedNoteDe(translatedNote || selected.notes_de || '');
    setEditing(true);
    setIsPolishChangedSinceTranslation(false);
    setEditedCaregiverFirstName(selected.caregiver_first_name || '');
    setEditedCaregiverLastName(selected.caregiver_last_name || '');
    setEditedCaregiverPhone(selected.caregiver_phone || '');
    setEditedPatientFirstName(selected.patient_first_name || '');
    setEditedPatientLastName(selected.patient_last_name || '');
  };

  const handleSave = async () => {
    try {
      const payload = {
        caregiver_first_name: editedCaregiverFirstName,
        caregiver_last_name: editedCaregiverLastName,
        caregiver_phone: editedCaregiverPhone,
        patient_first_name: editedPatientFirstName,
        patient_last_name: editedPatientLastName,
      };
  
      editedAnswers.forEach((ans, i) => { payload[`q${i + 1}`] = ans; });
      editedAnswersDe.forEach((ans, i) => { payload[`q${i + 1}_de`] = ans; });
      payload.notes = editedNote;
      payload.notes_de = editedNoteDe;
  
      // 🔁 Zapis do backendu
      const res = await axios.patch(
        `${API_BASE_URL}/api/tabResponses/${selected.id}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
  
      const updated = res.data;
  
      const updatedSelected = {
        ...selected,
        ...payload,
        user_name: updated.user_name || selected.user_name,
        edit_history: updated.edit_history
      };
  
      setSelected(updatedSelected);
      setGermanAnswers(editedAnswersDe);
      setTranslatedNote(editedNoteDe);
      setEditing(false);
      setIsTranslated(true);
  
      toast.success('Dane zapisane pomyślnie!');
      window.dispatchEvent(new Event('feedbackUpdated')); // 🔔 odśwież listę w tle
    } catch (err) {
      console.error('Błąd zapisu:', err);
      toast.error('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
    }
  };

  const handleDynamicTranslate = async () => {
  setTranslating(true);
  try {
    let textsToTranslate = editing
      ? editedAnswers.concat(editedNote)
      : questionsPl.map((_, i) => selected[`q${i + 1}`] || '').concat(selected.notes || '');

    const trimmed = textsToTranslate.map(t => t.trim());
    const emptyCount = trimmed.filter(t => t.length === 0).length;

    if (emptyCount > 0) {
      toast.warn('Brakuje odpowiedzi w co najmniej jednym polu.');
    }

    // tłumaczymy tylko niepuste
    const toSend = trimmed.filter(t => t.length > 0);
    if (toSend.length === 0) {
      setTranslating(false);
      return;
    }

    const { data } = await axios.post(
      `${API_BASE_URL}/api/translate`,
      { texts: toSend, source: 'pl', target: 'de' },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    if (data && Array.isArray(data.translations)) {
      const answersDe = [];
      let j = 0;
      for (let i = 0; i < textsToTranslate.length; i++) {
        if (textsToTranslate[i].trim().length === 0) {
          answersDe.push('');
        } else {
          answersDe.push(data.translations[j++] || '');
        }
      }

      setGermanAnswers(answersDe.slice(0, questionsPl.length));
      setTranslatedNote(answersDe[questionsPl.length] || '');
      setIsTranslated(true);
      setIsPolishChangedSinceTranslation(false);
      toast.success('Tłumaczenie zakończone.');
    } else {
      throw new Error('Niepoprawny format danych z API');
    }
  } catch (err) {
    console.error('🔴 Błąd tłumaczenia:', err.response?.data || err.message);
    toast.error('Nie udało się przetłumaczyć.');
  } finally {
    setTranslating(false);
  }
};


  const handleToggleGerman = async () => {
    if (!showGerman) {
      if (!isTranslated || isPolishChangedSinceTranslation || editing) {
        await handleDynamicTranslate();
      }
      setShowGerman(true);
    } else {
      setShowGerman(false);
    }
  };

  const handlePolishAnswerChange = (index, value) => {
    const arr = [...editedAnswers];
    arr[index] = value;
    setEditedAnswers(arr);
    setIsPolishChangedSinceTranslation(true);
  };

  const handlePolishNoteChange = (value) => {
    setEditedNote(value);
    setIsPolishChangedSinceTranslation(true);
  };

  if (loading) return <Wrapper><p>Ładowanie...</p></Wrapper>;
  if (error) return <Wrapper><p>{error}</p></Wrapper>;

  const questions = showGerman ? questionsDe : questionsPl;
  const answers = editing
    ? (showGerman ? editedAnswersDe : editedAnswers)
    : (showGerman
        ? (germanAnswers.length > 0 ? germanAnswers : questionsPl.map((_, i) => selected[`q${i+1}_de`] || ''))
        : questionsPl.map((_, i) => selected[`q${i+1}`] || '')
      );

  const noteLabel = showGerman ? noteLabelDe : noteLabelPl;
  const noteContent = editing
    ? (showGerman ? editedNoteDe : editedNote)
    : (showGerman
        ? (translatedNote || selected.notes_de || '')
        : (selected.notes || '')
      );

      const fetchDetails = async (id) => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/api/tabResponses`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const match = res.data.find(r => r.id === id);
          if (match) {
            setSelected(match); // 🔁 aktualizujemy selected
            toast.success('Dane zostały odświeżone.');
          } else {
            toast.warn('Nie znaleziono wpisu.');
          }
        } catch (err) {
          console.error('Błąd pobierania szczegółów feedbacku:', err);
          toast.error('Błąd odświeżania danych.');
        }
      };

  return (
    <Wrapper>
     <TitleRow>
  <LeftButtons>
    <SmallButton onClick={handleBack}>
      <FaArrowLeft /> Wstecz
    </SmallButton>
  </LeftButtons>

  <Title>Szczegóły odpowiedzi</Title>

  <RightButtons>
    {editing ? (
      <SmallButton onClick={handleSave} disabled={translating}>
        {translating ? <SpinnerIcon size={16} /> : <FaSave />}
        {translating ? 'Zapisywanie...' : 'Zapisz'}
      </SmallButton>
    ) : (
      <SmallButton onClick={initEdit}>
        <FaEdit /> Edytuj
      </SmallButton>
    )}
  </RightButtons>
</TitleRow>
<DetailCard>
<DetailSection>
<FieldCard>
    <SectionTitle>Dane opiekunki:</SectionTitle>
    <FieldItem>
      <FieldName>Imię i nazwisko:</FieldName>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <FieldInput
            value={editedCaregiverFirstName}
            onChange={(e) => setEditedCaregiverFirstName(e.target.value)}
            placeholder="Imię"
          />
          <FieldInput
            value={editedCaregiverLastName}
            onChange={(e) => setEditedCaregiverLastName(e.target.value)}
            placeholder="Nazwisko"
          />
        </div>
      ) : (
        <FieldValue>
          {selected.caregiver_first_name} {selected.caregiver_last_name}
        </FieldValue>
      )}
    </FieldItem>

    <FieldItem>
      <FieldName>Telefon:</FieldName>
      {editing ? (
        <FieldInput
          value={editedCaregiverPhone}
          onChange={(e) => setEditedCaregiverPhone(e.target.value)}
          placeholder="Numer telefonu"
        />
      ) : (
        <FieldValue>{selected.caregiver_phone}</FieldValue>
      )}
    </FieldItem>

  {/* 🧓 DANE PACJENTA */}
    <SectionTitle style={{ marginTop: '32px' }}>Dane pacjenta:</SectionTitle>
    <FieldItem>
      <FieldName>Imię i nazwisko:</FieldName>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <FieldInput
            value={editedPatientFirstName}
            onChange={(e) => setEditedPatientFirstName(e.target.value)}
            placeholder="Imię"
          />
          <FieldInput
            value={editedPatientLastName}
            onChange={(e) => setEditedPatientLastName(e.target.value)}
            placeholder="Nazwisko"
          />
        </div>
      ) : (
        <FieldValue>
          {selected.patient_first_name} {selected.patient_last_name}
        </FieldValue>
      )}
    </FieldItem>
  </FieldCard>
</DetailSection>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
  <div style={{ width: '80px' }} /> {/* lewa przestrzeń */}

  <Title style={{ textAlign: 'center', flex: 1 }}>Feedback</Title>

  <SmallButtonRefresh onClick={() => fetchDetails(selected.id)}>
    <FaSyncAlt style={{ transition: 'transform 0.3s ease' }} />
    Odśwież
  </SmallButtonRefresh>
</div>

        <TabSection>
          <TabsBar>
            <TabButton active={!showGerman} onClick={() => setShowGerman(false)} disabled={translating}>Polski</TabButton>
            <TabButton active={showGerman} onClick={handleToggleGerman} disabled={translating}>{translating ? 'Tłumaczę...' : 'Deutsch'}</TabButton>
          </TabsBar>
              <QuestionGroup style={{ marginTop: '32px' }}>
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
            <OptionButton key={val} active={selected.q1 === val}>{val}</OptionButton>
          ))}
     
        </div>
        {(selected.q1 === 'średnio' || selected.q1 === 'mam zastrzeżenia') && (
          <TextArea
            value={selected.q2 || ''}
            readOnly
            placeholder="Dlaczego?"
            rows={3}
          />
        )}
      </QuestionGroup>

{/* Pytanie 2: trudności */}  
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
    {[
      'występują nocki',
      'osoba jest trudna',
      'jest ciężki transfer',
      'brak',
      'inne trudności'
    ].map((option, index) => (
      <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={(selected.q3 || []).includes(option)}
          readOnly
                    style={{
            width: '20px',
            height: '20px',
            accentColor: '#007bff'
          }}
        />
        
        <span>{option}</span>
      </label>
    ))}
  </div>

  {(selected.q3 || []).includes('Inne trudności') && (
    <TextArea
      value={selected.q4 || ''}
      readOnly
      placeholder="Szczegóły dotyczące trudności"
      rows={3}
    />
  )}
</QuestionGroup>

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
      <OptionButton key={val} active={selected.q5 === val}>{val}</OptionButton>
    ))}
  </div>
</QuestionGroup>

{/* Pytanie 4: budżet tygodniowy */}
<QuestionGroup>
  <Label>4. Ile wynosi budżet na tydzień? (w Euro)</Label>
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
    <TextArea
      value={selected.q6 || ''}
      readOnly
      placeholder="Np. 50 €"
      rows={1}
      style={{
        textAlign: 'center',
        fontSize: '16px'
      }}
    />
  </div>
  </div>
</QuestionGroup>

      {/* Pytanie 5: powrót */}
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
            <OptionButton key={val} active={selected.q7 === val}>{val}</OptionButton>
          ))}
        </div>
        {selected.q7 === 'Nie' && (
          <TextArea
            value={selected.q7_why || ''}
            readOnly
            placeholder="Dlaczego nie?"
            rows={3}
          />
        )}
      </QuestionGroup>
      {/* Pytanie 6: plusy i minusy */}
<QuestionGroup>
  <Label>6. Napisz 2 plusy:</Label>
  <TextArea
    value={selected.q8_plus || ''}
    readOnly
    rows={2}
    placeholder="Np. dobra atmosfera, wsparcie rodziny..."
    style={{ marginBottom: '16px' }}
  />

  <Label>...i 2 minusy zlecenia (jeśli są):</Label>
  <TextArea
    value={selected.q8_minus || ''}
    readOnly
    rows={2}
    placeholder="Np. brak czasu wolnego, trudna komunikacja..."
  />
</QuestionGroup>
{/* Notatka końcowa */}
<QuestionGroup>
  <Label style={{ fontWeight: '600', fontSize: '16px' }}>Notatka</Label>
  <TextArea
    value={noteContent || ''}
    readOnly
    rows={4}
    placeholder="Dodatkowe uwagi, komentarze, spostrzeżenia..."
  />
</QuestionGroup>
</TabSection>


{/* Sekcja historia edycji */}
<div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<CenteredSectionTitle>Historia edycji:</CenteredSectionTitle>
  {selected.edit_history && selected.edit_history.length > 0 ? (() => {
    try {
      const historyArray = JSON.parse(selected.edit_history) || [];

      if (!Array.isArray(historyArray)) return <p style={{ color: '#999' }}>Brak historii edycji.</p>;

      const reversed = [...historyArray].reverse();
      const firstFive = reversed.slice(0, 5);

      return (
        <>

          <div style={{
    flex: 1,
    overflowY: 'auto',
    paddingRight: '8px',
    border: '1px solid #eee',
    borderRadius: '8px',
    background: '#fafafa',
    width:'80vh',
  }}> 
          <ul style={{ paddingLeft: '20px' }}>
            {firstFive.map((entry, index) => (
        <li key={index} style={{
            padding: '10px 0',
            borderBottom: '1px solid #ddd',
            color: '#333',
            fontSize: '15px'
          }}>
            {entry}
          </li>
            ))}
          </ul>
</div>
          {reversed.length > 5 && (
            <div style={{ textAlign: 'center' }}>
<Button onClick={() => setShowHistoryModal(true)}>
  Pokaż całą historię
</Button>
</div>
          )}

<Modal
  isOpen={showHistoryModal}
  onRequestClose={() => setShowHistoryModal(false)}
  contentLabel="Pełna historia edycji"
  ariaHideApp={false}
  shouldFocusAfterRender={false}
  style={{
    content: {
      width: '600px',
      maxHeight: '80vh',
      padding: '24px 32px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      background: '#fff',
      inset: '0',
      margin: 'auto',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }}
>
  {/* Nagłówek */}
  <h2
    style={{
      textAlign: 'center',
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: '#fff',
      borderRadius: '8px',
      marginBottom: '24px'
    }}
  >
    Pełna historia edycji
  </h2>
  <TopInfoRow>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <FieldName>Data dodania:</FieldName>
    <FieldValue>{new Date(selected.created_at).toLocaleString()}</FieldValue>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <FieldName>Dodane przez:</FieldName>
    <FieldValue>{selected.user_name}</FieldValue>
  </div>
</TopInfoRow>
  <div style={{
    flex: 1,
    overflowY: 'auto',
    paddingRight: '8px',
    border: '1px solid #eee',
    borderRadius: '8px',
    background: '#fafafa'
  }}>
    <ul style={{ listStyle: 'none', padding: '5px' }}>
      {reversed.map((entry, index) => (
        <li key={index} style={{
          padding: '10px 0',
          borderBottom: '1px solid #ddd',
          color: '#333',
          fontSize: '15px'
        }}>
          {entry}
        </li>
      ))}
    </ul>
  </div>
  

  {/* Przycisk zamknij */}
  <div style={{display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'}}>
  <Button 
    onClick={() => setShowHistoryModal(false)}
  >
    Zamknij
  </Button>
  </div>
</Modal>
        </>
      );
    } catch {
      return <p style={{ color: '#999' }}>Brak historii edycji.</p>;
    }
  })() : (
    <p style={{ color: '#999', marginTop: '12px' }}>Brak historii edycji.</p>
  )}
</div>

      </DetailCard>

    </Wrapper>
  );
};

export default TabFeedbackDetails;
