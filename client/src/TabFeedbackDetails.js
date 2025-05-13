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
  background-color: ${props =>
    props.active
      ? '#007bff'
      : props.warning
      ? '#f8d7da'
      : '#f0f0f0'};
  color: ${props =>
    props.active
      ? '#fff'
      : props.warning
      ? '#721c24'
      : '#333'};
  border: 1px solid ${props =>
    props.active
      ? '#007bff'
      : props.warning
      ? '#f5c6cb'
      : '#ccc'};
  box-shadow: ${props =>
    props.active
      ? '0 0 6px rgba(0, 123, 255, 0.3)'
      : 'none'};
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
  '1. Jak ogólnie czuje się Pani/Pan z klientem?',
  '1a. Dlaczego?',
  '2. Czy istnieją trudności w opiece nad pacjentem/pacjentką?',
  '2a. Szczegóły dotyczące trudności',
  '3. Czy ma Pani/Pan czas wolny?',
  '4. Ile wynosi budżet na tydzień? (w Euro)',
  '5. Czy chciałabyś wrócić do rodziny?',
  '5a. Dlaczego nie?',
  '6. Napisz 2 plusy:',
  '6a. ...i 2 minusy zlecenia (jeśli są):'
];
const questionsDe = [
  '1. Wie steht BK generell zum Kunden?',
  '1a. Warum?',
  '2. Gibt es Schwierigkeiten bei der Pflege des Patienten/der Patientin?',
  '2a. Details zu den Schwierigkeiten',
  '3. Hat BK freie Zeit?',
  '4. Wie hoch ist das Wochenbudget? (in Euro)',
  '5. Möchte BK zur Familie zurückkehren?',
  '5a. Warum nicht?',
  '6. Nennen Sie 2 Pluspunkte:',
  '6a. ...und 2 Minuspunkte (falls vorhanden):'
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

const translationMapPlToDe = {
  'bardzo dobrze': 'sehr gut',
  'dobrze': 'gut',
  'średnio': 'mittelmäßig',
  'mam zastrzeżenia': 'ich habe Bedenken',
  'występują nocki': 'es gibt Nachtdienste',
  'osoba jest trudna': 'die Person ist schwierig',
  'jest ciężki transfer': 'es gibt schwierige Transfers',
  'brak': 'keine',
  'inne trudności': 'andere Schwierigkeiten',
  'Tak': 'Ja',
  'Nie': 'Nein',
  'Dlaczego?': 'Warum?',
  'Szczegóły dotyczące trudności': 'Details zu den Schwierigkeiten',
  'Dlaczego nie?': 'Warum nicht?',
  'Np. 50 €': 'z. B. 50 €',
  'Np. dobra atmosfera, wsparcie rodziny...': 'z. B. gute Atmosphäre, Unterstützung der Familie...',
  'Np. brak czasu wolnego, trudna komunikacja...': 'z. B. wenig Freizeit, schwierige Kommunikation...',
  'Dodatkowe uwagi...': 'Weitere Hinweise...'
};

const t = (text) => showGerman ? (translationMapPlToDe[text] || text) : text;

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
    const questionGroups = [
      ['q1'],
      ['q3', 'q4'],
      ['q5'],
      ['q6'],
      ['q7', 'q7_why'],
      ['q8_plus', 'q8_minus']
    ];

    const fieldsToTranslate = ['q1', 'q3', 'q4', 'q5', 'q6', 'q7', 'q7_why', 'q8_plus', 'q8_minus'];

    const textsToTranslate = editing
      ? fieldsToTranslate.map((key, idx) => editedAnswers[idx] || '').concat(editedNote)
      : fieldsToTranslate.map(key => selected[key] || '').concat(selected.notes || '');

    const groupedEmpty = questionGroups
      .map((fields, idx) =>
        fields.every(f => ((editing ? (editedAnswers[fieldsToTranslate.indexOf(f)] || '') : (selected[f] || '')).trim() === ''))
          ? idx
          : -1
      )
      .filter(idx => idx !== -1);

    if (groupedEmpty.length > 0) {
      toast.warn(`Brak odpowiedzi w ${groupedEmpty.length} pytaniu/ach. Puste pola zostaną oznaczone.`);
    }

    if (groupedEmpty.length === questionGroups.length) {
      toast.warn('Brak tekstu do tłumaczenia.');
      setTranslating(false);
      return;
    }

    const trimmed = textsToTranslate.map(t => t.trim());
    const toSend = trimmed.filter(t => t.length > 0);

    const { data } = await axios.post(
      `${API_BASE_URL}/api/translate`,
      { texts: toSend, source: 'pl', target: 'de' },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    if (data && Array.isArray(data.translations)) {
      const answersDe = [];
      let j = 0;
      for (let i = 0; i < textsToTranslate.length; i++) {
        if (trimmed[i].length === 0) {
          answersDe.push('[brak tekstu do tłumaczenia]');
        } else {
          answersDe.push(data.translations[j++] || '');
        }
      }

      setGermanAnswers(answersDe.slice(0, fieldsToTranslate.length));
      setTranslatedNote(answersDe[fieldsToTranslate.length] || '');
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

const isMissingTranslation = (val) => val?.trim() === '[brak tekstu do tłumaczenia]';

const getMissingTranslationMessage = (val) =>
  isMissingTranslation(val) ? (
    <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
      Brak odpowiedzi do tłumaczenia
    </span>
  ) : null;

const getTextAreaStyle = (val) => {
  return val?.trim() === '[brak tekstu do tłumaczenia]'
    ? { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }
    : {};
};

const getInputStyle = (val) => {
  return val?.trim() === '[brak tekstu do tłumaczenia]'
    ? { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }
    : {};
};

const getOptionWarningStyle = (val) => {
  return val?.trim() === '[brak tekstu do tłumaczenia]'
    ? { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }
    : {};
};


const handleToggleGerman = async () => {
  if (!showGerman) {
    if (germanAnswers.length === 0 || isPolishChangedSinceTranslation || editing) {
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
{/* Pytanie 1 */}
<QuestionGroup style={{ marginTop: '32px' }}>
  <Label>
    {questions[0]} {getMissingTranslationMessage(answers[0])}
  </Label>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: '16px', justifyContent: 'center', marginTop: '12px', width: '100%', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
    {['bardzo dobrze', 'dobrze', 'średnio', 'mam zastrzeżenia'].map(val => {
      const translated = t(val);
      return (
        <OptionButton
          key={val}
          active={selected.q1 === val}
          warning={isMissingTranslation(translated) && selected.q1 === val}
        >
          {translated}
        </OptionButton>
      );
    })}
  </div>
  {(selected.q1 === 'średnio' || selected.q1 === 'mam zastrzeżenia') && (
    <>
      <Label>{questions[1]} {getMissingTranslationMessage(answers[1])}</Label>
      <TextArea
        value={selected.q2 || ''}
        readOnly
        placeholder={t('Dlaczego?')}
        rows={3}
        style={getTextAreaStyle(selected.q2)}
      />
    </>
  )}
</QuestionGroup>

{/* Pytanie 2 */}
<QuestionGroup>
  <Label>
    {questions[2]} {getMissingTranslationMessage(answers[2])}
  </Label>
  <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', columnGap: '30px', rowGap: '12px', marginTop: '10px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
    {['występują nocki', 'osoba jest trudna', 'jest ciężki transfer', 'brak', 'inne trudności'].map((val, index) => (
      <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={(selected.q3 || []).includes(val)} readOnly style={{ width: '20px', height: '20px', accentColor: '#007bff' }} />
        <span>{t(val)}</span>
      </label>
    ))}
    {(selected.q3 || []).includes('inne trudności') && (
      <>
        <Label>{questions[3]} {getMissingTranslationMessage(answers[3])}</Label>
        <TextArea
          key="textarea"
          value={selected.q4 || ''}
          readOnly
          placeholder={t('Szczegóły dotyczące trudności')}
          rows={2}
          style={getTextAreaStyle(selected.q4)}
        />
      </>
    )}
  </div>
</QuestionGroup>

{/* Pytanie 3 */}
<QuestionGroup>
  <Label>
    {questions[4]} {getMissingTranslationMessage(answers[4])}
  </Label>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', columnGap: '120px', rowGap: '12px', justifyContent: 'center', marginTop: '12px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
    {['Tak', 'Nie'].map(val => {
      const translated = t(val);
      return (
        <OptionButton
          key={val}
          active={selected.q5 === val}
          warning={isMissingTranslation(translated) && selected.q5 === val}
        >
          {translated}
        </OptionButton>
      );
    })}
  </div>
</QuestionGroup>

{/* Pytanie 4 */}
<QuestionGroup>
  <Label>
    {questions[5]} {getMissingTranslationMessage(answers[5])}
  </Label>
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', width: '100%' }}>
    <div style={{ position: 'relative', maxWidth: '220px', width: '100%' }}>
      <TextArea
        value={selected.q6 || ''}
        readOnly
        placeholder={t('Np. 50 €')}
        rows={1}
        style={{ textAlign: 'center', fontSize: '16px', ...getTextAreaStyle(selected.q6) }}
      />
    </div>
  </div>
</QuestionGroup>

{/* Pytanie 5 */}
<QuestionGroup>
  <Label>
    {questions[6]} {getMissingTranslationMessage(answers[6])}
  </Label>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', columnGap: '120px', rowGap: '12px', justifyContent: 'center', marginTop: '12px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
    {['Tak', 'Nie'].map(val => {
      const translated = t(val);
      return (
        <OptionButton
          key={val}
          active={selected.q7 === val}
          warning={isMissingTranslation(translated) && selected.q7 === val}
        >
          {translated}
        </OptionButton>
      );
    })}
  </div>
  {selected.q7 === 'Nie' && (
    <>
      <Label>{questions[7]} {getMissingTranslationMessage(answers[7])}</Label>
      <TextArea
        value={selected.q7_why || ''}
        readOnly
        placeholder={t('Dlaczego nie?')}
        rows={3}
        style={getTextAreaStyle(selected.q7_why)}
      />
    </>
  )}
</QuestionGroup>

{/* Pytanie 6 */}
<QuestionGroup>
  <Label>
    {questions[8]} {getMissingTranslationMessage(answers[8])}
  </Label>
  <TextArea
    value={selected.q8_plus || ''}
    readOnly
    rows={2}
    placeholder={t('Np. dobra atmosfera, wsparcie rodziny...')}
    style={{ marginBottom: '16px', ...getTextAreaStyle(selected.q8_plus) }}
  />
  <Label>
    {questions[9]} {getMissingTranslationMessage(answers[9])}
  </Label>
  <TextArea
    value={selected.q8_minus || ''}
    readOnly
    rows={2}
    placeholder={t('Np. brak czasu wolnego, trudna komunikacja...')}
    style={getTextAreaStyle(selected.q8_minus)}
  />
</QuestionGroup>

{/* Notatka */}
<QuestionGroup>
  <Label style={{ fontWeight: '600', fontSize: '16px' }}>
    {noteLabel} {getMissingTranslationMessage(noteContent)}
  </Label>
  <TextArea
    value={noteContent || ''}
    readOnly
    rows={4}
    placeholder={t('Dodatkowe uwagi...')}
    style={getTextAreaStyle(noteContent)}
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
