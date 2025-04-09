// TabInputData.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Ustawienie zmiennej API_BASE_URL z pliku .env (Vite)
const API_BASE_URL = process.env.REACT_APP_API_URL;

function TabInputData({ setIsAdding, fetchEntries, editingEntry }) {
  // Inicjalizacja formularza z wartościami z editingEntry, jeśli istnieje
  const [form, setForm] = useState({
    imie: editingEntry ? editingEntry.imie : '',
    nazwisko: editingEntry ? editingEntry.nazwisko : '',
    telefon: editingEntry ? editingEntry.telefon : '',
    jezyk: editingEntry ? editingEntry.jezyk : '',
    fs: editingEntry ? editingEntry.fs : '',
    nr: editingEntry ? editingEntry.nr : '',
    do_opieki: editingEntry ? (editingEntry.do_opieki?.split(',') || []) : [],
    dyspozycyjnosc: editingEntry ? editingEntry.dyspozycyjnosc : '',
    oczekiwania: editingEntry ? editingEntry.oczekiwania : '',
    referencje: editingEntry ? editingEntry.referencje : '',
    ostatni_kontakt: editingEntry ? editingEntry.ostatni_kontakt : '',
    notatka: editingEntry ? editingEntry.notatka : '',
    proponowane_zlecenie: editingEntry ? editingEntry.proponowane_zlecenie: '',
  });
  // Funkcja do zmiany wartości formularza
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };
  const handleCheckboxChange = (value) => {
    setForm(prevForm => {
      const isChecked = prevForm.do_opieki.includes(value);
      const updated = isChecked
        ? prevForm.do_opieki.filter(v => v !== value)
        : [...prevForm.do_opieki, value];
      return { ...prevForm, do_opieki: updated };
    });
  };

  // Funkcja do obsługi wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Konwersja daty na odpowiedni format
    if (!form.ostatni_kontakt) {
      form.ostatni_kontakt = null;  // Jeśli brak daty, ustawiamy NULL
    } else {
      const date = new Date(form.ostatni_kontakt);
      form.ostatni_kontakt = date.toISOString().split('T')[0];  // Format YYYY-MM-DD
    }
    form.do_opieki = form.do_opieki.join(',');
    try {
      if (editingEntry) {
        await axios.put(`${API_BASE_URL}/entries/${editingEntry.id}`, form);
        toast.success('Dane zaktualizowane!');
        fetchEntries();
      } else {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/entries`, form, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Wpis dodany');
        fetchEntries();
      }
      setIsAdding(false);  // Zamknięcie formularza po zapisaniu
    } catch (err) {
      console.error('Błąd zapisu danych:', err.response || err);
      toast.error('Błąd zapisu danych');
    }

    // Resetowanie formularza
    setForm({
      imie: '',
      nazwisko: '',
      telefon: '',
      jezyk: '',
      fs: '',
      nr: '',
      do_opieki: '',
      dyspozycyjnosc: '',
      oczekiwania: '',
      referencje: '',
      ostatni_kontakt: '',
      notatka: '',
      proponowane_zlecenie: ''
    });
  };

  return (
    <div
      style={{
        minHeight: '90vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Overlay dla lepszej czytelności */}
      <div
        style={{
          padding: 5,
          width: '100%',
          maxWidth: '800px',
          position: 'relative',
          zIndex: 2,
          borderRadius: '12px',
          boxSizing: 'border-box'
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: 0 // usunięto przerwę
          }}
        >
          {editingEntry ? 'Edycja danych opiekunki:' : 'Dodaj opiekunkę:'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Imię i nazwisko */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 16, marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Imię</label>
              <input
                type="text"
                placeholder="Wpisz imię"
                value={form.imie}
                onChange={(e) => handleChange('imie', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Nazwisko</label>
              <input
                type="text"
                placeholder="Wpisz nazwisko"
                value={form.nazwisko}
                onChange={(e) => handleChange('nazwisko', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Poziom języka, FS, NR */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Telefon</label>
              <input
                type="text"
                placeholder="Wpisz numer telefonu"
                value={form.telefon}
                onChange={(e) => handleChange('telefon', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
              </div> 
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Poziom języka</label>
              <select
                value={form.jezyk}
                onChange={(e) => handleChange('jezyk', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Wybierz</option>
                {['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>FS</label>
              <select
                value={form.fs}
                onChange={(e) => handleChange('fs', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Wybierz</option>
                <option value="Tak">Tak</option>
                <option value="Nie">Nie</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>NR</label>
              <select
                value={form.nr}
                onChange={(e) => handleChange('nr', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Wybierz</option>
                <option value="Tak">Tak</option>
                <option value="Nie">Nie</option>
              </select>
            </div>
          </div>

          {/* Do opieki + Dyspozycyjność */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Do opieki</label>
  <div style={{   display: 'grid', 
  gridTemplateColumns: '1fr 1fr', 
  gap: '6px 12px'  }}>
    {['senior', 'seniorka', 'małżeństwo', 'osoba leżąca'].map(option => (
      <label key={option} style={{ fontWeight: 400 }}>
        <input
          type="checkbox"
          checked={form.do_opieki.includes(option)}
          onChange={() => handleCheckboxChange(option)}
          style={{ marginRight: 6 }}
        />
        {option}
      </label>
    ))}
  </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Dyspozycyjność</label>
              <input
                type="month"
                value={form.dyspozycyjnosc}
                onChange={(e) => handleChange('dyspozycyjnosc', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Oczekiwania */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Oczekiwania</label>
            <textarea
              placeholder="własna łazienka, bez nocek, bez transferu itd"
              value={form.oczekiwania}
              onChange={(e) => handleChange('oczekiwania', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Referencje */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Referencje</label>
              <select
                value={form.referencje}
                onChange={(e) => handleChange('referencje', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Wybierz</option>
                <option value="Tak">Tak</option>
                <option value="Nie">Nie</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Ostatni kontakt</label>
              <input
                type="date"
                value={form.ostatni_kontakt}
                onChange={(e) => handleChange('ostatni_kontakt', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Notatka */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Notatka</label>
            <textarea
              placeholder="Dodatkowe informacje..."
              value={form.notatka}
              onChange={(e) => handleChange('notatka', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Proponowane zlecenie</label>
              <input
                type="text"
                placeholder="Wpisz infromacje o proponowanym zleceniu lub numer zlecenia stałego"
                value={form.proponowane_zlecenie}
                onChange={(e) => handleChange('proponowane_zlecenie', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: 10
            }}
          >
            {editingEntry ? 'Zapisz zmiany' : 'Dodaj wpis'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TabInputData;
