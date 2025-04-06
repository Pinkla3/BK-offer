import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import TabInputData from './TabInputData'; // Komponent do dodawania nowych danych

Modal.setAppElement('#root');  // Ustawienie aplikacji jako root dla modala

const tdStyle = {
  padding: '10px',
  verticalAlign: 'top',
  borderBottom: '1px solid #eee',
  fontSize: '14px'
};

const deleteBtn = {
  backgroundColor: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '4px 8px',
  cursor: 'pointer'
};

const labelStyle = {
  display: 'block',
  textAlign: 'left',
  fontWeight: 600,
  marginBottom: 4,
  marginLeft: 3
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  boxSizing: 'border-box',
  outlineColor: '#007bff'
};

// Funkcja formatująca datę w formacie "YYYY-MM" na czytelny napis "Miesiąc RRRR"
const formatMonthYear = (monthYearStr) => {
  if (!monthYearStr || monthYearStr.length !== 7 || !monthYearStr.includes('-')) return '';
  const [year, month] = monthYearStr.split('-');
  if (!month || !year || isNaN(month) || isNaN(year)) return '';
  
  const date = new Date(year, month - 1);
  const months = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Funkcja konwertująca napis w formacie "Miesiąc RRRR" na "YYYY-MM"
const convertToMonthYearFormat = (monthYearStr) => {
  if (!monthYearStr) return '';
  const months = {
    'styczeń': '01', 'luty': '02', 'marzec': '03', 'kwiecień': '04', 'maj': '05', 'czerwiec': '06',
    'lipiec': '07', 'sierpień': '08', 'wrzesień': '09', 'październik': '10', 'listopad': '11', 'grudzień': '12'
  };
  const [monthName, year] = monthYearStr.split(' ');
  const month = months[monthName.toLowerCase()] || '01';
  return `${year}-${month}`;
};

function TabViewData() {
  const [entries, setEntries] = useState([]);
  const [sortedEntries, setSortedEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState('nazwisko');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 10);
  };

  // Normalizowanie danych pobranych z backendu
  const normalizeEntryData = (entry) => {
    return {
      ...entry,
      imie: entry.imie,
      nazwisko: entry.nazwisko,
      jezyk: entry.jezyk,
      fs: entry.fs,
      nr: entry.nr,
      do_opieki: entry.do_opieki,
      dyspozycyjnosc: entry.dyspozycyjnosc,
      oczekiwania: entry.oczekiwania,
      referencje: entry.referencje,
      ostatni_kontakt: entry.ostatni_kontakt,
      notatka: entry.notatka
    }
  };

  // Filtrowanie wpisów – dodano wyszukiwanie po nazwach miesięcy
  const filterEntries = (entries) => {
    if (!searchQuery) return entries;
    return entries.filter(entry => {
      const dyspozycyjnoscFormatted = entry.dyspozycyjnosc ? formatMonthYear(entry.dyspozycyjnosc) : '';
      const searchString = `${entry.imie} ${entry.nazwisko} ${entry.jezyk} ${entry.fs} ${entry.nr} ${entry.do_opieki} ${entry.dyspozycyjnosc} ${dyspozycyjnoscFormatted} ${entry.oczekiwania} ${entry.referencje} ${entry.ostatni_kontakt} ${entry.notatka}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
  };

  // Pobieranie danych z backendu
  const fetchEntries = () => {
    axios.get('/entries')
      .then(res => {
        const normalizedData = res.data.map(normalizeEntryData);
        setEntries(normalizedData);
        setSortedEntries(normalizedData);
      })
      .catch(error => console.error('Błąd pobierania danych:', error));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Obsługa zmiany w polu wyszukiwania
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Sortowanie wpisów
  const handleSort = (column) => {
    let newSortOrder = 'asc';
    if (sortColumn === column) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    const columnKey = column
      .toLowerCase()
      .replace(/\s+/g, '_')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ąćęłńóśżź]/g, (match) => match.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
    const sortedData = [...entries].sort((a, b) => {
      let valueA = a[columnKey];
      let valueB = b[columnKey];
      if (valueA === undefined || valueB === undefined) {
        return 0;
      }
      if (!isNaN(valueA) && !isNaN(valueB)) {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return newSortOrder === 'asc' 
          ? valueA.localeCompare(valueB, 'pl', { sensitivity: 'base' })
          : valueB.localeCompare(valueA, 'pl', { sensitivity: 'base' });
      }
      return newSortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    setSortedEntries(sortedData);
    setSortOrder(newSortOrder);
    setSortColumn(column);
  };

  // Usuwanie wpisu
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    try {
      await axios.delete(`/entries/${id}`);
      toast.success('Wpis usunięty');
      fetchEntries();
    } catch {
      toast.error('Błąd podczas usuwania');
    }
  };

  // Inicjalizacja formularza edycji
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEditForm({
      ...entry,
      dyspozycyjnosc: entry.dyspozycyjnosc
        ? (/^\d{4}-\d{2}$/.test(entry.dyspozycyjnosc)
            ? entry.dyspozycyjnosc
            : convertToMonthYearFormat(entry.dyspozycyjnosc))
        : '',
      ostatni_kontakt: formatDate(entry.ostatni_kontakt),
    });
  };

  // Obsługa zmian w formularzu edycji – dla pola "dyspozycyjność" używamy input type "month"
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Zapisywanie edytowanego wpisu
  const handleSaveEdit = async () => {
    try {
      await axios.put(`/entries/${editingEntry.id}`, editForm);
      toast.success('Zaktualizowano dane');
      setEditingEntry(null);
      fetchEntries();
    } catch {
      toast.error('Błąd edycji');
    }
  };

  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center' }}>📄 Wpisy w bazie danych</h2>
      
      {/* Kontener z przyciskiem oraz polem wyszukiwania */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsSearchVisible(prev => !prev)}
          style={{
            width: '220px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isSearchVisible ? 'Ukryj wyszukiwanie' : 'Pokaż wyszukiwanie'}
        </button>
        {isSearchVisible && (
          <input
            type="text"
            placeholder="Wyszukaj..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              outlineColor: '#007bff'
            }}
          />
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#007bff' }}>
          <tr>
            {['#', 'Imię', 'Nazwisko', 'Język', 'FS', 'NR', 'Do opieki', 'Dyspozycyjność', 'Oczekiwania', 'Referencje', 'Ostatni kontakt', 'Notatka'].map((col, i) => {
              const columnKey = col.toLowerCase().replace(' ', '_');
              return (
                <th
                  key={i}
                  style={{
                    padding: '10px',
                    color: '#fff',
                    fontWeight: '600',
                    textAlign: 'left',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSort(columnKey)}
                >
                  {col}
                  {sortColumn === columnKey && (sortOrder === 'asc' ? ' 🔼' : ' 🔽')}
                </th>
              );
            })}
            <th style={{ padding: '10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setIsAdding(true)}>
              <button
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {filterEntries(sortedEntries).map((entry, index) => (
            <tr
              key={entry.id}
              style={{
                borderBottom: '1px solid #eee',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => handleEdit(entry)}
            >
              <td>{index + 1}</td>
              <td>{entry.imie}</td>
              <td>{entry.nazwisko}</td>
              <td>{entry.jezyk}</td>
              <td>{entry.fs}</td>
              <td>{entry.nr}</td>
              <td>{entry.do_opieki}</td>
              <td>{entry.dyspozycyjnosc ? formatMonthYear(entry.dyspozycyjnosc) : '—'}</td>
              <td>{entry.oczekiwania}</td>
              <td>{entry.referencje}</td>
              <td>{entry.ostatni_kontakt ? formatDate(entry.ostatni_kontakt) : '—'}</td>
              <td>{entry.notatka}</td>
              <td>
                <button onClick={(e) => handleDelete(entry.id, e)} style={deleteBtn}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={!!editingEntry}
        onRequestClose={() => setEditingEntry(null)}
        contentLabel="Edytuj wpis"
        style={{
          content: {
            maxWidth: '600px',
            margin: 'auto',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: '#fff'
          }
        }}
      >
        <button
          onClick={() => setEditingEntry(null)}
          style={{
            position: 'absolute',
            top: 10,
            right: 15,
            background: 'transparent',
            border: 'none',
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          &times;
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>✏️ Edycja wpisu</h2>
        {editingEntry && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Imię</label>
                <input type="text" value={editForm.imie || ''} onChange={e => handleEditChange('imie', e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nazwisko</label>
                <input type="text" value={editForm.nazwisko || ''} onChange={e => handleEditChange('nazwisko', e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Język</label>
                <select value={editForm.jezyk || ''} onChange={e => handleEditChange('jezyk', e.target.value)} style={inputStyle}>
                  <option value="">Wybierz</option>
                  {['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>FS</label>
                <select value={editForm.fs || ''} onChange={e => handleEditChange('fs', e.target.value)} style={inputStyle}>
                  <option value="">Wybierz</option>
                  <option value="Tak">Tak</option>
                  <option value="Nie">Nie</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>NR</label>
                <select value={editForm.nr || ''} onChange={e => handleEditChange('nr', e.target.value)} style={inputStyle}>
                  <option value="">Wybierz</option>
                  <option value="Tak">Tak</option>
                  <option value="Nie">Nie</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Do opieki</label>
                <select value={editForm.do_opieki || ''} onChange={e => handleEditChange('do_opieki', e.target.value)} style={inputStyle}>
                  <option value="">Wybierz</option>
                  <option value="senior">Senior</option>
                  <option value="seniorka">Seniorka</option>
                  <option value="małżeństwo">Małżeństwo</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Dyspozycyjność</label>
                {/* Input typu "month" – wartość w formacie "YYYY-MM" */}
                <input
                  type="month"
                  value={editForm.dyspozycyjnosc || ''}
                  onChange={e => handleEditChange('dyspozycyjnosc', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Oczekiwania</label>
              <textarea value={editForm.oczekiwania || ''} onChange={e => handleEditChange('oczekiwania', e.target.value)} rows={3} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Referencje</label>
                <select value={editForm.referencje || ''} onChange={e => handleEditChange('referencje', e.target.value)} style={inputStyle}>
                  <option value="">Wybierz</option>
                  <option value="Tak">Tak</option>
                  <option value="Nie">Nie</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Ostatni kontakt</label>
                <input type="date" value={editForm.ostatni_kontakt || ''} onChange={e => handleEditChange('ostatni_kontakt', e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', textAlign: 'center', fontWeight: 600, marginBottom: 4 }}>Notatka</label>
              <textarea value={editForm.notatka || ''} onChange={e => handleEditChange('notatka', e.target.value)} rows={3} style={inputStyle} />
            </div>
            <button type="submit" style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              💾 Zapisz zmiany
            </button>
          </form>
        )}
      </Modal>
      <Modal
        isOpen={isAdding}
        onRequestClose={() => setIsAdding(false)}
        contentLabel="Dodaj nowy wpis"
        style={{
          content: {
            maxWidth: '600px',
            margin: 'auto',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: '#fff'
          }
        }}
      >
        <button
          onClick={() => setIsAdding(false)}
          style={{
            position: 'absolute',
            top: 10,
            right: 15,
            background: 'transparent',
            border: 'none',
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          &times;
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>+ Dodaj nowy wpis</h2>
        <TabInputData setIsAdding={setIsAdding} fetchEntries={fetchEntries} />
      </Modal>
    </div>
  );
}

export default TabViewData;