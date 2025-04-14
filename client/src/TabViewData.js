// TabViewData.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import TabInputData from './TabInputData';
import EditOffersModal from './EditOffersModal';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL;

Modal.setAppElement('#root');

const tdStyle1 = {
  padding: '10px',
  verticalAlign: 'top',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
  textAlign: 'justify'
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

function TabViewData({ user }) {
  const [entries, setEntries] = useState([]);
  const [sortedEntries, setSortedEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState('nazwisko');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [availability, setAvailability] = useState("2025-05");
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    fetchEntries();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 10);
  };

  const formatMonthYear = (monthYear) => {
    if (!monthYear) return '—';
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' });
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
      notatka: entry.notatka,
      proponowane_zlecenie: entry.proponowane_zlecenie
    };
  };

  // Filtrowanie wpisów – wyszukiwanie w tabeli wpisów
  const filterEntries = (entries) => {
    if (!searchQuery) return entries;
  
    return entries.filter(entry => {
      const dyspozycyjnoscFormatted = entry.dyspozycyjnosc 
        ? new Date(entry.dyspozycyjnosc).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' })
        : '';
  
      const searchString = `
        ${entry.imie} 
        ${entry.nazwisko} 
        ${entry.jezyk}
        ${entry.telefon} 
        ${entry.fs} 
        ${entry.nr} 
        ${entry.do_opieki} 
        ${dyspozycyjnoscFormatted} 
        ${entry.oczekiwania} 
        ${entry.referencje} 
        ${entry.ostatni_kontakt} 
        ${entry.notatka}
        ${entry.proponowane_zlecenie}
      `.toLowerCase();
  
      return searchString.includes(searchQuery.toLowerCase());
    });
  };

  const fetchEntries = () => {
    const token = localStorage.getItem('token');
    console.log('Token JWT:', token); 
    console.log('fetchEntries start');
    if (!token) {
      console.warn('Brak tokenu JWT, nie można pobrać danych.');
      return;
    }
    axios
      .get(`${API_BASE_URL}/api/entries`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        const normalizedData = res.data.map(normalizeEntryData);
        setEntries(normalizedData);
        setSortedEntries(normalizedData);
        setCurrentPage(1); // Reset paginacji przy pobraniu nowych danych
        console.log('Otrzymane dane z /entries:', res.data);
      })
      .catch((error) => console.error('Błąd pobierania danych:', error));
  };

  // Obsługa zmiany w polu wyszukiwania
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Mapowanie nagłówków na właściwe klucze danych
  const columnMapping = {
    'imię': 'imie',
    'nazwisko': 'nazwisko',
    'język': 'jezyk',
    'telefon': 'telefon',
    'fs': 'fs',
    'nr': 'nr',
    'do opieki': 'do_opieki',
    'dyspozycyjność': 'dyspozycyjnosc',
    'oczekiwania': 'oczekiwania',
    'referencje': 'referencje',
    'ostatni kontakt': 'ostatni_kontakt',
    'notatka': 'notatka',
    'porponowane zlecenie': 'proponowane_zlecenie'
  };

  // Sortowanie wpisów
  const handleSort = (column) => {
    let newSortOrder = 'asc';
    if (sortColumn === column) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    const headerKey = column.toLowerCase();
    const columnKey = columnMapping[headerKey] || headerKey;
    const collator = new Intl.Collator('pl', { sensitivity: 'base' });

    const sortedData = [...entries].sort((a, b) => {
      let valueA = a[columnKey];
      let valueB = b[columnKey];
      if (valueA === undefined || valueB === undefined) return 0;
      if (!isNaN(valueA) && !isNaN(valueB)) {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return newSortOrder === 'asc'
          ? collator.compare(valueA, valueB)
          : collator.compare(valueB, valueA);
      }
      return newSortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    setSortedEntries(sortedData);
    setSortOrder(newSortOrder);
    setSortColumn(column);
    setCurrentPage(1);
  };

  // Zmieniona funkcja handleDelete z tokenem
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/entries/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Wpis usunięty');
      fetchEntries();
    } catch {
      toast.error('Błąd podczas usuwania');
    }
  };

  // Inicjalizacja formularza edycji
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setAvailability(entry.dyspozycyjnosc || "");
    setEditForm({
      ...entry,
      dyspozycyjnosc: entry.dyspozycyjnosc || '',
      ostatni_kontakt: formatDate(entry.ostatni_kontakt),
    });
  };

  // Obsługa zmian w formularzu edycji
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'dyspozycyjnosc') {
      setAvailability(value);
    }
  };

  // Funkcja zapisu edytowanego wpisu
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/entries/${editingEntry.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Zaktualizowano dane');
      setEditingEntry(null);
      fetchEntries();
    } catch {
      toast.error('Błąd edycji');
    }
  };

  // Paginacja – obliczanie wpisów do wyświetlenia
  const filtered = filterEntries(sortedEntries);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const currentEntries = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center' }}>Lista Opiekunek</h2>
      
      {/* Kontener z przyciskiem oraz polem wyszukiwania */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop:'20px', marginBottom: '20px', justifyContent: 'center', padding:'10px' }}>
        <button
          onClick={() => {
            setIsSearchVisible((prev) => {
              if (prev) setSearchQuery('');
              return !prev;
            });
          }}
          style={{
            width: '220px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <FaSearch style={{ fontSize: '18px' }} />
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
            {['#', 'Imię', 'Nazwisko','Numer telefonu', 'Język', 'FS', 'NR', 'Do opieki', 'Dyspozycyjność', 'Oczekiwania', 'Referencje', 'Ostatni kontakt', 'Notatka', 'Proponowane zlecenie'].map((col, i) => {
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
                    cursor: 'pointer',
                    minWidth: '100px'
                  }}
                  onClick={() => handleSort(col)}
                >
                  {col}
                  {sortColumn === col && (sortOrder === 'asc' ? ' 🔼' : ' 🔽')}
                </th>
              );
            })}
            {user?.role === 'admin' && (
              <th style={{ padding: '10px', color: '#fff', minWidth: '100px' }}>Użytkownik</th>
            )}

            <th style={{ padding: '10px', textAlign: 'center', minWidth: '50px' }}>
              <button
                onClick={() => setIsAdding(true)}
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'background-color 0.3s'
                }}
                title="Dodaj nowy wpis"
              >
                <FaPlus />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
  {currentEntries && currentEntries.length > 0 && currentEntries.map((entry, index) => (
    <tr
      key={entry.id}
      style={{
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        padding: '10px'
      }}
      onClick={() => handleEdit(entry)}
    >
      <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
      <td>{entry.imie}</td>
      <td>{entry.nazwisko}</td>
      <td>{entry.telefon || '---'}</td>
      <td>{entry.jezyk}</td>
      <td>{entry.fs}</td>
      <td>{entry.nr}</td>
      <td>{entry.do_opieki}</td>
      <td>{formatMonthYear(entry.dyspozycyjnosc)}</td>
      <td style={{ textAlign: 'justify' }}>{entry.oczekiwania}</td>
      <td style={{ textAlign: 'justify' }}>{entry.notatka}</td>
      <td style={{ textAlign: 'justify' }}>{entry.proponowane_zlecenie}</td>
      <td>{entry.ostatni_kontakt ? formatDate(entry.ostatni_kontakt) : '—'}</td>
      {user?.role === 'admin' && (
        <td style={{
          padding: '10px',
          verticalAlign: 'top',
          borderBottom: '1px solid #eee',
          fontSize: '14px'
        }}>
          {entry.user_name}
        </td>
      )}
      <td style={{ padding: '10px', textAlign: 'center' }}>
        <button
          onClick={(e) => handleDelete(entry.id, e)}
          style={{
            backgroundColor: 'red',
            color: '#fff',
            border: 'none',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'background-color 0.3s'
          }}
          title="Usuń wpis"
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>

      {/* Paginação */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            style={{
              margin: '0 5px',
              padding: '8px 12px',
              borderRadius: '4px',
              border: page === currentPage ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: page === currentPage ? '#007bff' : '#fff',
              color: page === currentPage ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Modal do edycji wpisu */}
      <Modal
        isOpen={!!editingEntry}
        onRequestClose={() => setEditingEntry(null)}
        contentLabel="Edytuj wpis"
        style={{
          content: {
            width: '800px',
            maxWidth: '80%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: '#ffffff',
            inset: '0',
            margin: 'auto',
            position: 'relative',
            zIndex: '1001'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '1000'
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
        <h2
          style={{
            textAlign: 'center',
            display: 'flex',
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15
          }}
        >
          Edycja danych opiekunki
        </h2>
        {editingEntry && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Imię</label>
                <input
                  type="text"
                  value={editForm.imie || ''}
                  onChange={e => handleEditChange('imie', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nazwisko</label>
                <input
                  type="text"
                  value={editForm.nazwisko || ''}
                  onChange={e => handleEditChange('nazwisko', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
                <label style={labelStyle}>Telefon</label>
                <input
                  type="text"
                  value={editForm.telefon || ''}
                  onChange={e => handleEditChange('telefon', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Język</label>
                <select
                  value={editForm.jezyk || ''}
                  onChange={e => handleEditChange('jezyk', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Wybierz</option>
                  {['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>FS</label>
                <select
                  value={editForm.fs || ''}
                  onChange={e => handleEditChange('fs', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Wybierz</option>
                  <option value="Tak">Tak</option>
                  <option value="Nie">Nie</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>NR</label>
                <select
                  value={editForm.nr || ''}
                  onChange={e => handleEditChange('nr', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Wybierz</option>
                  <option value="Tak">Tak</option>
                  <option value="Nie">Nie</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Do opieki</label>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
    {['senior', 'seniorka', 'małżeństwo', 'osoba leżąca'].map(option => (
      <label key={option} style={{ fontWeight: 400 }}>
        <input
          type="checkbox"
          checked={editForm.do_opieki?.split(',').includes(option) || false}
          onChange={() => {
            const updatedList = editForm.do_opieki
              ? editForm.do_opieki.split(',').filter(Boolean)
              : [];
            const newList = updatedList.includes(option)
              ? updatedList.filter(item => item !== option)
              : [...updatedList, option];
            setEditForm(prev => ({ ...prev, do_opieki: newList.join(',') }));
          }}
          style={{ marginRight: 6 }}
        />
        {option}
      </label>
    ))}
  </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Dyspozycyjność</label>
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
              <textarea
                value={editForm.oczekiwania || ''}
                onChange={e => handleEditChange('oczekiwania', e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Referencje</label>
                <select
                  value={editForm.referencje || ''}
                  onChange={e => handleEditChange('referencje', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Wybierz</option>
                  <option value="Tak">Tak</option>
                  <option value="Nie">Nie</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
  <label style={labelStyle}>Ostatni kontakt</label>
  <input
    type="date"
    value={editForm.ostatni_kontakt || ''}
    onChange={e => handleEditChange('ostatni_kontakt', e.target.value)}
    style={inputStyle}
  />
</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', textAlign: 'center', fontWeight: 600, marginBottom: 4 }}>Notatka</label>
              <textarea
                value={editForm.notatka || ''}
                onChange={e => handleEditChange('notatka', e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
                <label style={labelStyle}>Proponowane zlecenie</label>
                <input
                  type="text"
                  value={editForm.proponowane_zlecenie || ''}
                  onChange={e => handleEditChange('proponowane_zlecenie', e.target.value)}
                  style={inputStyle}
                />
              </div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setIsOffersModalOpen(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  zIndex: '2001'
                }}
              >
                Pokaż oferty pracy dla dyspozycyjności w {editForm.dyspozycyjnosc || availability}
              </button>
              <EditOffersModal
                isOpen={isOffersModalOpen}
                onRequestClose={() => setIsOffersModalOpen(false)}
                availability={editForm.dyspozycyjnosc || availability}
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
                cursor: 'pointer'
              }}
            >
              Zapisz zmiany
            </button>
          </form>
        )}
      </Modal>
      <Modal
        isOpen={isAdding}
        onRequestClose={() => setIsAdding(false)}
        contentLabel="Dodaj dane opiekunki"
        style={{
          content: {
            width: '800px',
            maxWidth: '80%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: '#ffffff',
            inset: '0',
            margin: 'auto',
            position: 'relative',
            zIndex: '1001'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '1000'
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
        <TabInputData setIsAdding={setIsAdding} fetchEntries={fetchEntries} />
      </Modal>
    </div>
  );
}

export default TabViewData;