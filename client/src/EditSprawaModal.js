import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');
const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

// pomocnicza funkcja zwracająca lokalną datę w formacie YYYY-MM-DD
const formatLocalDate = dateLike => {
  const d = new Date(dateLike);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function EditSprawaModal({ isOpen, onRequestClose, id, onUpdated }) {
  const isNew = id == null;
  const emptyForm = {
    imie: '',
    nazwisko: '',
    telefon: '',
    data_wplyniecia: '',
    do_wykonania: '',
    sprawa: '',
    podjete_dzialanie: ''
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');

    if (isNew) {
      setForm(emptyForm);
    } else {
      axios.get(
        `${API_BASE_URL}/api/sprawy-biezace/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
       const {
  imie,
  nazwisko,
  telefon,
  data_wplyniecia: rawDate,
  do_wykonania: rawDue,
  sprawa,
  podjete_dzialanie
} = res.data;

setForm({
  imie,
  nazwisko,
  telefon: telefon || '',
  data_wplyniecia: rawDate ? formatLocalDate(rawDate) : '',
  do_wykonania: rawDue ? formatLocalDate(rawDue) : '',
  sprawa,
  podjete_dzialanie
});
      })
      .catch(err => {
        console.error('Błąd wczytywania sprawy:', err);
        toast.error('Nie udało się wczytać danych');
        onRequestClose();
      });
    }
  }, [id, isOpen, isNew]);

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // jeśli data pusta, zostaw pusty string (backend dogra dzisiejszą)
    const payload = { ...form };

    const req = isNew
      ? axios.post(`${API_BASE_URL}/api/sprawy-biezace`, payload, config)
      : axios.put(`${API_BASE_URL}/api/sprawy-biezace/${id}`, payload, config);

    req
      .then(() => {
        toast.success(isNew ? 'Dodano sprawę bieżącą' : 'Zaktualizowano sprawę');
        onUpdated();
        onRequestClose();
      })
      .catch(err => {
        console.error('Błąd zapisu sprawy:', err);
        toast.error(isNew ? 'Nie udało się dodać sprawy' : 'Nie udało się zaktualizować sprawy');
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={isNew ? "Dodaj sprawę bieżącą" : "Edytuj sprawę bieżącą"}
      style={modalStyles}
    >
      <button onClick={onRequestClose} style={closeBtnStyle} aria-label="Zamknij">
        &times;
      </button>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isNew ? 'Dodaj sprawę bieżącą' : 'Edytuj sprawę bieżącą'}
      </h2>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }} noValidate>
        <label style={labelStyle}>Imię</label>
        <input
          type="text"
          value={form.imie}
          onChange={e => handleChange('imie', e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Nazwisko</label>
        <input
          type="text"
          value={form.nazwisko}
          onChange={e => handleChange('nazwisko', e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Telefon</label>
        <input
          type="text"
          value={form.telefon}
          onChange={e => handleChange('telefon', e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Data wpłynięcia</label>
        <input
          type="date"
          value={form.data_wplyniecia}
          onChange={e => handleChange('data_wplyniecia', e.target.value)}
          style={inputStyle}
        />
<label style={labelStyle}>Do wykonania</label>
<input
  type="date"
  value={form.do_wykonania}
  onChange={e => handleChange('do_wykonania', e.target.value)}
  style={inputStyle}
/>
        <label style={labelStyle}>Sprawa</label>
        <textarea
          rows={3}
          value={form.sprawa}
          onChange={e => handleChange('sprawa', e.target.value)}
          style={textareaStyle}
        />

        <label style={labelStyle}>Podjęte działanie</label>
        <textarea
          rows={3}
          value={form.podjete_dzialanie}
          onChange={e => handleChange('podjete_dzialanie', e.target.value)}
          style={textareaStyle}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" style={saveBtnStyle}>
            {isNew ? 'Dodaj' : 'Zapisz'}
          </button>
          <button type="button" onClick={onRequestClose} style={cancelBtnStyle}>
            Anuluj
          </button>
        </div>
      </form>
    </Modal>
  );
}

const modalStyles = {
  content: {
    width: '800px',
    maxWidth: '80%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '30px',
    borderRadius: '12px',
    background: '#fff',
    inset: '0',
    margin: 'auto',
    position: 'relative',
    zIndex: '1001'
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: '1000'
  }
};

const closeBtnStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'transparent',
  border: 'none',
  fontSize: '24px',
  fontWeight: 'bold',
  cursor: 'pointer',
  lineHeight: 1
};

const labelStyle = {
  display: 'block',
  marginTop: '10px',
  marginBottom: '4px',
  fontWeight: 600
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical'
};

const saveBtnStyle = {
  flex: 1,
  padding: '10px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const cancelBtnStyle = {
  flex: 1,
  padding: '10px',
  backgroundColor: '#6c757d',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};