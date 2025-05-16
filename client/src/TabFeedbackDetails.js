import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaSave, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import Modal from 'react-modal';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

const InputBase = ({ error, ...rest }) => <input {...rest} />;

const Input = styled(InputBase)`
  padding: 8px;
  font-size: 14px;
  border: 1px solid ${p => p.error ? '#e74c3c' : '#ccc'};
  border-radius: 4px;
`;

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

const OptionButton = styled(({ active, editing, ...rest }) => <button {...rest} />)`
  margin-top: 0;
  padding: 10px 20px;
  width: 100%;
  max-width: 300px;
  background-color: ${props => (props.active ? '#007bff' : '#f0f0f0')};
  color: ${props => (props.active ? '#fff' : '#333')};
  border: 1px solid ${props => (props.active ? '#007bff' : '#ccc')};
  box-shadow: ${props => (props.active ? '0 0 6px rgba(0, 123, 255, 0.3)' : 'none')};
  
  ${props =>
    props.editing &&
    `
      &:hover {
        background-color: ${props.active ? '#0056b3' : '#e0e0e0'};
        cursor: pointer;
      }
    `}
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
  max-width: 160px; 
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
  '',
  '2. Czy istnieją trudności w opiece nad pacjentem/pacjentką?',
  '',
  '3. Czy ma pani/pan czas wolny?',
  '4. Ile wynosi budżet na tydzień? (w Euro)',
  '5. Czy chciałby/chciałaby pan/pani wrócić do rodziny?',
  '',
  '6. Napisz 2 plusy:',
  ' ...i 2 minusy zlecenia (jeśli są):'
];
const questionsDe = [
  '1. Wie steht BK generell zum Kunden?',
  '',
  '2. Gibt es Schwierigkeiten bei der Pflege des Patienten/der Patientin?',
  '',
  '3. Hat Sie freie Zeit?',
  '4. Wie hoch ist das Wochenbudget? (in Euro)',
  '5. Möchte Sie zur Familie zurückkehren?',
  '',
  '6. Nennen Sie 2 Pluspunkte:',
  ' ...und 2 Minuspunkte (falls vorhanden):'
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
  if (editing && selected) {
    setEditedAnswers([
      selected.q1 || '',
      selected.q2 || '',
      Array.isArray(selected.q3)
        ? selected.q3
        : typeof selected.q3 === 'string'
        ? selected.q3.split(', ')
        : [],
      selected.q4 || '',
      selected.q5 || '',
      selected.q6 || '',
      selected.q7 || '',
      selected.q7_why || '',
      selected.q8_plus || '',
      selected.q8_minus || '',
      selected.q9 || '',
      selected.q10 || ''
    ]);

    setEditedAnswersDe([
      selected.q1_de || '',
      selected.q2_de || '',
      selected.q3_de || '',
      selected.q4_de || '',
      selected.q5_de || '',
      selected.q6_de || '',
      selected.q7_de || '',
      selected.q7_why_de || '',
      selected.q8_plus_de || '',
      selected.q8_minus_de || '',
      selected.q9_de || '',
      selected.q10_de || ''
    ]);
  }
}, [editing, selected]);

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
    const answers = editedAnswers;
    const answersDe = editedAnswersDe;
    const note = editedNote;
    const noteDe = editedNoteDe;

    const translationMapPlToDe = {
      'bardzo dobrze': 'sehr gut',
      'dobrze': 'gut',
      'średnio': 'durchschnittlich',
      'mam zastrzeżenia': 'Ich habe Bedenken',
      'Tak': 'Ja',
      'Nie': 'Nein'
    };

    const reverseTranslationMap = {
      'sehr gut': 'bardzo dobrze',
      'gut': 'dobrze',
      'durchschnittlich': 'średnio',
      'Ich habe Bedenken': 'mam zastrzeżenia',
      'Ja': 'Tak',
      'Nein': 'Nie'
    };

    const payload = {
      caregiver_first_name: editedCaregiverFirstName,
      caregiver_last_name: editedCaregiverLastName,
      caregiver_phone: editedCaregiverPhone,
      patient_first_name: editedPatientFirstName,
      patient_last_name: editedPatientLastName,
      no_history: showGerman
    };

    const assignIfFilled = (val, key) => {
      if (val?.toString().trim()) payload[key] = val;
    };

    if (showGerman) {
      // Tekstowe pola _de
      assignIfFilled(answersDe[1], 'q2_de');
      assignIfFilled(answersDe[3], 'q4_de');
      assignIfFilled(answersDe[7], 'q7_why_de');
      assignIfFilled(answersDe[8], 'q8_plus_de');
      assignIfFilled(answersDe[9], 'q8_minus_de');
      assignIfFilled(answersDe[10], 'q9_de');
      assignIfFilled(answersDe[11], 'q10_de');
      assignIfFilled(noteDe, 'notes_de');

      // Synchronizowane mapą: q1, q5, q7
      if (answersDe[0]?.trim()) {
        payload.q1_de = answersDe[0];
        payload.q1 = reverseTranslationMap[answersDe[0]] || selected.q1;
      }
      if (answersDe[4]?.trim()) {
        payload.q5_de = answersDe[4];
        payload.q5 = reverseTranslationMap[answersDe[4]] || selected.q5;
      }
      if (answersDe[6]?.trim()) {
        payload.q7_de = answersDe[6];
        payload.q7 = reverseTranslationMap[answersDe[6]] || selected.q7;
      }

      // q3 (checkbox)
      const q3de = Array.isArray(answersDe[2]) ? answersDe[2].join(', ') : answersDe[2] || '';
      if (q3de) {
        payload.q3_de = q3de;
        payload.q3 = q3de;
      }

      // q6 (liczba)
      const q6de = answersDe[5]?.toString().trim();
      if (q6de) {
        payload.q6_de = q6de;
        payload.q6 = q6de;
      }

    } else {
      // Tekstowe pola PL
      assignIfFilled(answers[1], 'q2');
      assignIfFilled(answers[3], 'q4');
      assignIfFilled(answers[7], 'q7_why');
      assignIfFilled(answers[8], 'q8_plus');
      assignIfFilled(answers[9], 'q8_minus');
      assignIfFilled(answers[10], 'q9');
      assignIfFilled(answers[11], 'q10');
      assignIfFilled(note, 'notes');

      // Synchronizowane mapą: q1, q5, q7
      if (answers[0]?.trim()) {
        payload.q1 = answers[0];
        payload.q1_de = translationMapPlToDe[answers[0]] || selected.q1_de;
      }
      if (answers[4]?.trim()) {
        payload.q5 = answers[4];
        payload.q5_de = translationMapPlToDe[answers[4]] || selected.q5_de;
      }
      if (answers[6]?.trim()) {
        payload.q7 = answers[6];
        payload.q7_de = translationMapPlToDe[answers[6]] || selected.q7_de;
      }

      // q3 (checkbox)
      const q3 = Array.isArray(answers[2]) ? answers[2].join(', ') : answers[2] || '';
      if (q3) {
        payload.q3 = q3;
        payload.q3_de = q3;
      }

      // q6 (liczba)
      const q6 = answers[5]?.toString().trim();
      if (q6) {
        payload.q6 = q6;
        payload.q6_de = q6;
      }
    }

    // PATCH do backendu
    const res = await axios.patch(
      `${API_BASE_URL}/api/tabResponses/${selected.id}`,
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    const updated = res.data;

    // Odśwież formularz
    const getAnswersFrom = (source, isGerman = false) =>
      Array.from({ length: 12 }, (_, i) => {
        const key = `q${i + 1}${isGerman ? '_de' : ''}`;
        const val = source[key];
        return key === 'q3' || key === 'q3_de'
          ? (typeof val === 'string' ? val.split(', ').filter(Boolean) : val || [])
          : val || '';
      });

    setEditedAnswers(getAnswersFrom(updated, false));
    setEditedAnswersDe(getAnswersFrom(updated, true));
    setEditedNote(updated.notes || '');
    setEditedNoteDe(updated.notes_de || '');
    setSelected(updated);
    setEditing(false);
    setIsTranslated(true);

    toast.success('Dane zapisane pomyślnie!');
    window.dispatchEvent(new Event('feedbackUpdated'));
  } catch (err) {
    console.error('❌ Błąd zapisu:', err);
    toast.error('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
  }
};



const odmianaPytanie = (count) => {
  if (count === 1) return 'pytaniu';
  if ([2, 3, 4].includes(count)) return 'pytaniach';
  return 'pytaniach';
};

const handleDynamicTranslate = async () => {
  setTranslating(true);
  try {
    const fieldMap = {
      q1: 0, q2: 1, q3: 2, q4: 3, q5: 4,
      q6: 5, q7: 6, q7_why: 7, q8_plus: 8,
      q8_minus: 9, q9: 10, q10: 11, notes: 12
    };

    const fieldsToTranslate = [
      'q1', 'q2', 'q3', 'q4', 'q5', 'q6',
      'q7', 'q7_why', 'q8_plus', 'q8_minus', 'q9', 'q10', 'notes'
    ];

    const textsToTranslate = [];
    const indexes = [];

    // 🔍 Grupy logiczne
    const groupsToCheck = [
      ['q1'],                     // Pytanie 1
      ['q3'],                     // Pytanie 2
      ['q5'],                     // Pytanie 3
      ['q6'],                     // Pytanie 4
      ['q7'],                     // Pytanie 5
      ['q8_plus', 'q8_minus'],    // Pytanie 6
      ['notes']                   // Notatka
    ];

    const missingGroupNames = [];

    groupsToCheck.forEach((keys) => {
      const allEmpty = keys.every((key) => {
        const idx = fieldMap[key];
        let val;

        if (key === 'notes') {
          val = editedNote || selected.notes || '';
        } else {
          const field = editedAnswers.length > idx
            ? editedAnswers[idx]
            : selected[key] || '';
          val = Array.isArray(field) ? field.join(', ') : field;
        }

        return String(val || '').trim().length === 0;
      });

      if (allEmpty) {
        if (keys.includes('notes')) {
          missingGroupNames.push('notes');
        } else {
          missingGroupNames.push('pytanie');
        }
      }
    });

    const emptyGroupCount = missingGroupNames.filter(g => g === 'pytanie').length;
    const hasMissingNote = missingGroupNames.includes('notes');

    // 🔍 Zbieranie pól do tłumaczenia
    fieldsToTranslate.forEach((key) => {
      const idx = fieldMap[key];
      let val;

      if (key === 'notes') {
        val = editedNote || selected.notes || '';
      } else {
        const field = editedAnswers.length > idx
          ? editedAnswers[idx]
          : selected[key] || '';
        val = Array.isArray(field) ? field.join(', ') : field;
      }

      const text = String(val || '').trim();
      const original = String(selected?.[key] || '').trim();
      const translation = String(selected?.[`${key}_de`] || '').trim();

      const wasChanged = text !== original;
      const translationMissing =
        !translation ||
        translation === '[brak tłumaczenia]' ||
        translation === '[brak tekstu do tłumaczenia]';

      const shouldTranslate = wasChanged || translationMissing;

      if (shouldTranslate && text.length > 0) {
        textsToTranslate.push(text);
        indexes.push(key);
      }
    });

    // 🧾 TOASTY: brak tekstów do tłumaczenia
    if (textsToTranslate.length === 0) {
      if (emptyGroupCount === 6 && hasMissingNote) {
        toast.error('Brak tłumaczenia – brak odpowiedzi na pytania.');
      } else if (emptyGroupCount === 0 && hasMissingNote) {
        toast.warn('Brak notatki.');
      } else if (emptyGroupCount > 0 && hasMissingNote) {
        toast.warn(`Brak tekstu do przetłumaczenia w ${emptyGroupCount} ${odmianaPytanie(emptyGroupCount)} i notatce.`);
      } else if (emptyGroupCount > 0) {
        toast.warn(`Brak tekstu do przetłumaczenia w ${emptyGroupCount} ${odmianaPytanie(emptyGroupCount)}.`);
      } else {
        toast.info('Tekst już został przetłumaczony.');
      }
      return;
    }

    // 🔁 Tłumaczenie przez API
    const { data } = await axios.post(`${API_BASE_URL}/api/translate`, {
      texts: textsToTranslate,
      source: 'pl',
      target: 'de'
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (!data?.translations || !Array.isArray(data.translations)) {
      throw new Error('Błąd formatu odpowiedzi z API');
    }

    // ✅ TOASTY po tłumaczeniu
toast.success('Tłumaczenie zakończone.');

if (emptyGroupCount > 0) {
  toast.warn(`Brakuje odpowiedzi w ${emptyGroupCount} ${odmianaPytanie(emptyGroupCount)}. Odpowiedzi te nie zostały przetłumaczone.`);
}

if (hasMissingNote) {
  toast.warn('Brakuje notatki. Nie została przetłumaczona.');
}

    const answersDe = Array(12).fill('');
    let translatedNote = '';

    indexes.forEach((key, i) => {
      const translation = data.translations[i];
      if (key === 'notes') {
        translatedNote = translation;
      } else {
        const index = fieldMap[key];
        answersDe[index] = translation;
      }
    });

    setEditedAnswersDe(answersDe);
    setGermanAnswers(answersDe);
    setEditedNoteDe(translatedNote);
    setTranslatedNote(translatedNote);

    const payload = {
      ...Object.fromEntries(Object.entries(fieldMap).map(([k, i]) => [
        k,
        Array.isArray(editedAnswers?.[i])
          ? editedAnswers[i].join(', ')
          : (editedAnswers?.[i] !== undefined && editedAnswers?.[i] !== ''
              ? editedAnswers[i]
              : selected?.[k] || '')
      ])),
      notes: editedNote !== undefined && editedNote !== '' ? editedNote : selected?.notes || '',
      ...Object.fromEntries(Object.entries(fieldMap).map(([k, i]) => [
        `${k}_de`,
        answersDe?.[i] || selected?.[`${k}_de`] || ''
      ])),
      notes_de: translatedNote || selected?.notes_de || '',
      caregiver_first_name: editedCaregiverFirstName || selected?.caregiver_first_name || '',
      caregiver_last_name: editedCaregiverLastName || selected?.caregiver_last_name || '',
      caregiver_phone: editedCaregiverPhone || selected?.caregiver_phone || '',
      patient_first_name: editedPatientFirstName || selected?.patient_first_name || '',
      patient_last_name: editedPatientLastName || selected?.patient_last_name || '',
      no_history: true
    };

    await axios.patch(`${API_BASE_URL}/api/tabResponses/${selected.id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    setSelected(prev => ({ ...prev, ...payload }));
    setIsTranslated(true);

  } catch (err) {
    console.error('❌ Błąd tłumaczenia:', err);
    toast.error('Nie udało się przetłumaczyć.');
  } finally {
    setTranslating(false);
  }
};

const isMissingTranslation = (val) => val?.trim() === '[brak tekstu do tłumaczenia]';

const getTextAreaStyle = (val) => {
  return val?.trim() === '[brak tekstu do tłumaczenia]'
    ? { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }
    : {};
};


const handleToggleGerman = async () => {
  console.log('📌 handleToggleGerman start — showGerman:', showGerman);

  if (!showGerman) {
    // Przechodzimy z PL → DE

    const originalPl = [
      selected.q1, selected.q2, selected.q3, selected.q4,
      selected.q5, selected.q6, selected.q7, selected.q7_why,
      selected.q8_plus, selected.q8_minus, selected.q9, selected.q10
    ];

    const currentPl = editing
      ? editedAnswers.map(val =>
          Array.isArray(val) ? val.join(', ') : val || ''
        )
      : [...originalPl];

    const translatedFromDb = [
      selected.q1_de, selected.q2_de, selected.q3_de, selected.q4_de,
      selected.q5_de, selected.q6_de, selected.q7_de, selected.q7_why_de,
      selected.q8_plus_de, selected.q8_minus_de, selected.q9_de, selected.q10_de
    ];

    let needsTranslation = false;

    for (let i = 0; i < currentPl.length; i++) {
      const plNow = String(currentPl[i] || '').trim();
      const plOld = String(originalPl[i] || '').trim();
      const de = String(translatedFromDb[i] || '').trim();

      const changed = editing ? (plNow !== plOld) : false;
      const missing = !de || de === '[brak tłumaczenia]' || de === '[brak tekstu do tłumaczenia]';

      if (changed || missing) {
        console.log(`❗ Pytanie ${i + 1} wymaga tłumaczenia: changed=${changed}, missing=${missing}`);
        needsTranslation = true;
        break;
      }
    }

    // Notatka
    const noteNow = (editing ? editedNote : selected.notes || '').trim();
    const noteOld = (selected.notes || '').trim();
    const noteDe = (selected.notes_de || '').trim();

    const noteChanged = editing ? (noteNow !== noteOld) : false;
    const noteMissing = !noteDe || noteDe === '[brak tłumaczenia]' || noteDe === '[brak tekstu do tłumaczenia]';

    if (noteChanged || noteMissing) {
      console.log(`❗ Notatka wymaga tłumaczenia: changed=${noteChanged}, missing=${noteMissing}`);
      needsTranslation = true;
    }

    if (needsTranslation || isPolishChangedSinceTranslation || editing || germanAnswers.length === 0) {
      console.log('🌍 Wywołanie handleDynamicTranslate()');
      await handleDynamicTranslate(); // tłumaczenie dynamiczne
    } else {
      // ✅ Fallback: jeśli tłumaczenie puste → użyj polskiej wartości
      setEditedAnswersDe(
        translatedFromDb.map((v, i) =>
          (v && v.trim() !== '[brak tłumaczenia]' && v.trim() !== '[brak tekstu do tłumaczenia]')
            ? v
            : originalPl[i] || ''
        )
      );
      setEditedNoteDe(
        noteDe && noteDe.trim() !== '[brak tłumaczenia]' && noteDe.trim() !== '[brak tekstu do tłumaczenia]'
          ? noteDe
          : selected.notes || ''
      );
      setTranslatedNote(noteDe || '');
      setIsTranslated(true);
    }

    setShowGerman(true);
  } else {
    // Wracamy z DE → PL
    setShowGerman(false);
  }
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

      const checkboxOptionsQ2 = [
  'występują nocki',
  'jest ciężki transfer',
  'osoba jest trudna',
  'brak',
  'inne trudności'
];

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
    {questions[0]}
    {showGerman && !editing && !(selected.q1_de || '').trim() && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>

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
    {['bardzo dobrze', 'dobrze', 'średnio', 'mam zastrzeżenia'].map((val) => {
      const translationMapPlToDe = {
        'bardzo dobrze': 'sehr gut',
        'dobrze': 'gut',
        'średnio': 'durchschnittlich',
        'mam zastrzeżenia': 'Ich habe Bedenken'
      };

      const plValue = val;
      const deValue = translationMapPlToDe[val];

      const currentPL = editing ? editedAnswers[0] : selected.q1;
      const isActive = currentPL === plValue;

      return (
        <OptionButton
          key={val}
          type="button"
          active={isActive}
          editing={editing}
          onClick={() => {
            if (!editing) return;
            const updatedPL = [...editedAnswers];
            const updatedDE = [...editedAnswersDe];
            updatedPL[0] = plValue;
            updatedDE[0] = deValue;
            setEditedAnswers(updatedPL);
            setEditedAnswersDe(updatedDE);
          }}
        >
          {showGerman ? deValue : plValue}
        </OptionButton>
      );
    })}
  </div>

  {/* Animowany input q2 (pokazuje się dla PL i DE odpowiedzi "średnio"/"mam zastrzeżenia") */}
  {(() => {
    const triggerWordsPL = ['średnio', 'mam zastrzeżenia'];
    const triggerWordsDE = ['durchschnittlich', 'Ich habe Bedenken'];

    const currentValue = editing
      ? editedAnswers[0] || editedAnswersDe[0]
      : selected.q1 || selected.q1_de;

    const shouldShow = triggerWordsPL.includes(currentValue) || triggerWordsDE.includes(currentValue);

    return (
      <div
        style={{
          marginTop: '16px',
          overflow: 'hidden',
          maxHeight: shouldShow ? '200px' : '0px',
          opacity: shouldShow ? 1 : 0,
          transition: 'all 0.4s ease',
          width: '100%'
        }}
      >
        <TextArea
          name="q2"
          value={
            editing
              ? (showGerman ? editedAnswersDe[1] : editedAnswers[1]) || ''
              : showGerman
                ? selected.q2_de || '[brak tłumaczenia]'
                : selected.q2 || ''
          }
          onChange={editing ? (e) => {
            const updated = showGerman ? [...editedAnswersDe] : [...editedAnswers];
            updated[1] = e.target.value;
            showGerman ? setEditedAnswersDe(updated) : setEditedAnswers(updated);
          } : undefined}
          placeholder={showGerman ? 'Warum?' : 'Dlaczego?'}
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
    );
  })()}
</QuestionGroup>
{/* Pytanie 2 */}
{/* Pytanie 2 — q3 + q4 (checkboxy wielokrotnego wyboru z synchronizacją) */}
<QuestionGroup>
  <Label>
    {questions[2]}
    {showGerman && (!selected.q3 || selected.q3.trim() === '') && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>

  {/* ZMIENNA list dostępna dla checkboxów i inputa */}
  {(() => {
    const list = editing
      ? Array.isArray(editedAnswers[2]) ? editedAnswers[2] : typeof editedAnswers[2] === 'string' ? editedAnswers[2].split(', ') : []
      : typeof selected.q3 === 'string' ? selected.q3.split(', ') : Array.isArray(selected.q3) ? selected.q3 : [];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          columnGap: '30px',
          rowGap: '12px',
          marginTop: '10px',
          maxWidth: '700px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {checkboxOptionsQ2.map(option => {
          const isChecked = list.includes(option);

          return (
            <label
              key={option}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px',
                cursor: editing ? 'pointer' : 'default',
                userSelect: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={!editing}
                onChange={() => {
                  if (!editing) return;

                  const toggle = (arr, val) =>
                    arr.includes(val)
                      ? arr.filter(i => i !== val)
                      : [...arr, val];

                  setEditedAnswers(prev => {
                    const prevList = Array.isArray(prev[2]) ? prev[2] : typeof prev[2] === 'string' ? prev[2].split(', ') : [];
                    const updated = toggle(prevList, option);
                    const newAnswers = [...prev];
                    newAnswers[2] = updated;
                    return newAnswers;
                  });

                  setEditedAnswersDe(prev => {
                    const prevList = Array.isArray(prev[2]) ? prev[2] : typeof prev[2] === 'string' ? prev[2].split(', ') : [];
                    const updated = toggle(prevList, option);
                    const newAnswers = [...prev];
                    newAnswers[2] = updated;
                    return newAnswers;
                  });
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#007bff'
                }}
              />
              <span>{t(option)}</span>
            </label>
          );
        })}

        {/* Input dla "inne trudności" */}
        <Input
          type="text"
          placeholder={t('Proszę podać szczegóły')}
          value={
            editing
              ? editedAnswers[3] || ''
              : showGerman
                ? selected.q4_de?.trim() || '[brak tekstu do tłumaczenia]'
                : selected.q4 || ''
          }
          onChange={editing ? (e) => {
            const val = e.target.value;
            const updatedPL = [...editedAnswers];
            updatedPL[3] = val;
            setEditedAnswers(updatedPL);

            const updatedDE = [...editedAnswersDe];
            updatedDE[3] = val;
            setEditedAnswersDe(updatedDE);
          } : undefined}
          readOnly={!editing}
          style={{
            width: '100%',
            maxWidth: '300px',
            visibility: list.includes('inne trudności') ? 'visible' : 'hidden',
            pointerEvents: list.includes('inne trudności') ? 'auto' : 'none'
          }}
        />
      </div>
    );
  })()}
</QuestionGroup>
{/* Pytanie 3 */}
<QuestionGroup>
  <Label>
    {questions[4]}
    {showGerman && !editing && !(selected.q5_de || '').trim() && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>
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
    {['Tak', 'Nie'].map(val => {
      const translationMap = { Tak: 'Ja', Nie: 'Nein' };
      const plVal = val;
      const deVal = translationMap[val];
      const current = editing ? editedAnswers[4] : selected.q5;
      const isActive = current === plVal;

      return (
        <OptionButton
          key={val}
          type="button"
          active={isActive}
          editing={editing}
          onClick={() => {
            if (!editing) return;
            const updatedPL = [...editedAnswers];
            const updatedDE = [...editedAnswersDe];
            updatedPL[4] = plVal;
            updatedDE[4] = deVal;
            setEditedAnswers(updatedPL);
            setEditedAnswersDe(updatedDE);
          }}
        >
          {showGerman ? deVal : plVal}
        </OptionButton>
      );
    })}
  </div>
</QuestionGroup>

{/* Pytanie 4 */}
<QuestionGroup>
  <Label>
    {questions[5]}
    {showGerman && !editing && (!(selected.q6_de || '').trim() || selected.q6_de === '0') && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>

  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', width: '100%' }}>
    <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
      <input
        type="number"
value={
  editing
    ? (showGerman ? editedAnswersDe[5] : editedAnswers[5]) ?? ''
    : showGerman
      ? (selected.q6_de && selected.q6_de !== '0' ? selected.q6_de : 'brak odpowiedzi do tłumaczenia')
      : (selected.q6 && selected.q6 !== '0' ? selected.q6 : '')
}
        placeholder={showGerman ? 'z. B. 50' : 'np. 50'}
        readOnly={!editing}
        onChange={editing ? (e) => {
          const val = e.target.value;
          const updated = showGerman ? [...editedAnswersDe] : [...editedAnswers];
          updated[5] = val;
          showGerman ? setEditedAnswersDe(updated) : setEditedAnswers(updated);
        } : undefined}
        onWheel={(e) => e.target.blur()}
        style={{
          width: '100%',
          height: '48px',
          fontSize: '18px',
          textAlign: 'center',
          padding: '8px 36px 8px 12px',
          border: '1px solid',
          borderRadius: '10px',
          backgroundColor: showGerman && (!(selected.q6_de || '').trim() || selected.q6_de === '0')
            ? '#f8d7da' : (editing ? '#fff' : '#f9f9f9'),
          borderColor: showGerman && (!(selected.q6_de || '').trim() || selected.q6_de === '0')
            ? '#f5c6cb' : '#ccc',
          color: showGerman && (!(selected.q6_de || '').trim() || selected.q6_de === '0')
            ? '#721c24' : '#000',
          appearance: 'textfield',
          MozAppearance: 'textfield'
        }}
      />
      <span style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: showGerman && (!(selected.q6_de || '').trim() || selected.q6_de === '0') ? '#721c24' : '#666',
        fontSize: '18px'
      }}>
        €
      </span>
    </div>
  </div>
</QuestionGroup>

{/* Pytanie 5 */}
<QuestionGroup>
  <Label>
    {questions[6]}
    {showGerman && !editing && !(selected.q7_de || '').trim() && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>

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
    {['Tak', 'Nie'].map(val => {
      const translationMap = { Tak: 'Ja', Nie: 'Nein' };
      const plVal = val;
      const deVal = translationMap[val];
      const current = editing ? editedAnswers[6] : selected.q7;
      const isActive = current === plVal;

      return (
        <OptionButton
          key={val}
          type="button"
          active={isActive}
          editing={editing}
          onClick={() => {
            if (!editing) return;
            const updatedPL = [...editedAnswers];
            const updatedDE = [...editedAnswersDe];
            updatedPL[6] = plVal;
            updatedDE[6] = deVal;
            setEditedAnswers(updatedPL);
            setEditedAnswersDe(updatedDE);
          }}
        >
          {showGerman ? deVal : plVal}
        </OptionButton>
      );
    })}
  </div>

  {/* 🔁 Animowane pole tekstowe (dla "Nie") */}
  {(() => {
    const triggerValuesPL = ['Nie'];
    const triggerValuesDE = ['Nein'];
    const selectedVal = editing ? editedAnswers[6] || editedAnswersDe[6] : selected.q7 || selected.q7_de;
    const shouldShow = triggerValuesPL.includes(selectedVal) || triggerValuesDE.includes(selectedVal);

    return (
      <div
        style={{
          marginTop: '16px',
          overflow: 'hidden',
          maxHeight: shouldShow ? '200px' : '0px',
          opacity: shouldShow ? 1 : 0,
          transition: 'all 0.4s ease',
          width: '100%'
        }}
      >
        <Label>
          {questions[7]}
          {showGerman && !editing && !(selected.q7_why_de || '').trim() && (
            <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
              Brak odpowiedzi do tłumaczenia
            </span>
          )}
        </Label>
        <TextArea
          value={
            editing
              ? (showGerman ? editedAnswersDe[7] : editedAnswers[7]) || ''
              : showGerman
                ? selected.q7_why_de || '[brak tekstu do tłumaczenia]'
                : selected.q7_why || ''
          }
          onChange={editing ? (e) => {
            const updated = showGerman ? [...editedAnswersDe] : [...editedAnswers];
            updated[7] = e.target.value;
            showGerman ? setEditedAnswersDe(updated) : setEditedAnswers(updated);
          } : undefined}
          readOnly={!editing}
          placeholder={showGerman ? 'Warum nicht?' : 'Dlaczego nie?'}
          rows={3}
        />
      </div>
    );
  })()}
</QuestionGroup>

{/* Pytanie 6 */}
<QuestionGroup>
  {/* q8_plus */}
  <Label>
    {questions[8]}
    {showGerman && !editing && !((editedAnswersDe[8] || selected.q8_plus_de)?.trim()) && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>
  <TextArea
value={
  editing
    ? editedAnswers[8] || ''
    : showGerman
      ? (editedAnswersDe[8] || selected.q8_plus_de || '[brak tłumaczenia]')
      : selected.q8_plus || ''
}
    readOnly={!editing}
    onChange={editing ? (e) => {
      const updated = [...editedAnswers];
      updated[8] = e.target.value;
      setEditedAnswers(updated);
    } : undefined}
    rows={2}
    placeholder={t('Np. dobra atmosfera, wsparcie rodziny...')}
    style={{
      marginBottom: '16px',
      backgroundColor: showGerman && !editing && !((editedAnswersDe[8] || selected.q8_plus_de)?.trim()) ? '#f8d7da' : '#fff',
      borderColor: showGerman && !editing && !((editedAnswersDe[8] || selected.q8_plus_de)?.trim()) ? '#f5c6cb' : '#ccc',
      color: showGerman && !editing && !((editedAnswersDe[8] || selected.q8_plus_de)?.trim()) ? '#721c24' : '#000'
    }}
  />

  {/* q8_minus */}
  <Label>
    {questions[9]}
    {showGerman && !editing && !((editedAnswersDe[9] || selected.q8_minus_de)?.trim()) && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>
  <TextArea
value={
  editing
    ? editedAnswers[9] || ''
    : showGerman
      ? (editedAnswersDe[9] || selected.q8_minus_de || '[brak tłumaczenia]')
      : selected.q8_minus || ''
}
    readOnly={!editing}
    onChange={editing ? (e) => {
      const updated = [...editedAnswers];
      updated[9] = e.target.value;
      setEditedAnswers(updated);
    } : undefined}
    rows={2}
    placeholder={t('Np. brak czasu wolnego, trudna komunikacja...')}
    style={{
      backgroundColor: showGerman && !editing && !((editedAnswersDe[9] || selected.q8_minus_de)?.trim()) ? '#f8d7da' : '#fff',
      borderColor: showGerman && !editing && !((editedAnswersDe[9] || selected.q8_minus_de)?.trim()) ? '#f5c6cb' : '#ccc',
      color: showGerman && !editing && !((editedAnswersDe[9] || selected.q8_minus_de)?.trim()) ? '#721c24' : '#000'
    }}
  />
</QuestionGroup>

{/* Notatka */}
<QuestionGroup>
  <Label style={{ fontWeight: '600', fontSize: '16px' }}>
    {noteLabel}
    {showGerman && (!editing ? !selected.notes : !editedNote || editedNote.trim() === '') && (
      <span style={{ color: 'red', fontSize: '13px', marginLeft: '8px' }}>
        Brak odpowiedzi do tłumaczenia
      </span>
    )}
  </Label>

  <TextArea
    value={
      editing
        ? (showGerman ? editedNoteDe : editedNote)
        : (showGerman
            ? (editedNoteDe || selected.notes_de || '[brak tłumaczenia]')
            : (editedNote || selected.notes || '')
          )
    }
    readOnly={!editing}
    onChange={editing ? (e) => {
      if (showGerman) {
        setEditedNoteDe(e.target.value);
      } else {
        setEditedNote(e.target.value);
      }
    } : undefined}
    rows={4}
    placeholder={t('Dodatkowe uwagi...')}
    style={{
      ...getTextAreaStyle(
        showGerman
          ? (editing ? editedNote : selected.notes)
          : (editing ? editedNote : selected.notes)
      ),
      ...(showGerman && (!selected.notes_de || selected.notes_de.trim() === '') && {
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        color: '#721c24'
      })
    }}
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
