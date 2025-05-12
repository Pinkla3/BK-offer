// TabSprawyBiezace.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import EditSprawaModal from './EditSprawaModal';
import TabInputSprawyBiezace from './TabInputSprawyBiezace';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';

Modal.setAppElement('#root');

// Utwórz instancję Axios z baseURL i obsługą ciasteczek (jeśli potrzebne)
const API_BASE_URL = 'https://desk.berlin-opiekunki.pl'|| '';

const headerStyle = {
  padding: 10,
  color: '#fff',
  fontWeight: 600,
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0',
  minWidth: 120,
  cursor: 'pointer',
  userSelect: 'none'
};

const actionColStyle = {
  ...headerStyle,
  width: '30px',
  textAlign: 'center'
};

const rowStyle = { borderBottom: '1px solid #eee' };
const cellStyle = { padding: 10, verticalAlign: 'top', fontSize: 14 };
const noteStyle = {
  textAlign: 'justify',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden'
};
const addBtnStyle = {
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
};
const searchToggleBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
};
const searchInputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  outlineColor: '#007bff',
  width: '250px'
};
const deleteBtnStyle = {
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
};

export default function TabSprawyBiezace() {
  const [cases, setCases] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSprawa, setEditingSprawa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const perPage = 10;

  useEffect(() => {
    fetchUser();
    fetchCases();
  }, []);

  const fetchUser = () => {
    const token = localStorage.getItem('token');
    axios
    .get(`${API_BASE_URL}/api/userdb`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data.user))
      .catch(() => toast.error('Nie udało się pobrać danych użytkownika'));
  };

  const fetchCases = () => {
    const token = localStorage.getItem('token');
    axios
      .get(`${API_BASE_URL}/api/sprawy-biezace`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCases(res.data))
      .catch(err => {
        console.error('Błąd pobierania spraw bieżących:', err);
        toast.error('Błąd pobierania spraw bieżących');
      });
  };

  const formatDate = ds => (ds ? new Date(ds).toLocaleDateString('pl-PL') : '—');

  const openEdit = id => {
    setEditingId(id);
    setEditingSprawa(cases.find(c => c.id === id));
    setIsEditOpen(true);
  };
  const openAdd = () => {
    setEditingId(null);
    setEditingSprawa(null);
    setIsAdding(true);
  };
  const closeEditModal = () => { setIsEditOpen(false); setEditingId(null); };
  const closeAddModal = () => { setIsAdding(false); setEditingSprawa(null); };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/sprawy-biezace/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Wpis usunięty');
      fetchCases();
    } catch {
      toast.error('Błąd podczas usuwania wpisu');
    }
  };

  // Sortowanie
  const handleSort = col => {
    let order = 'asc';
    if (sortColumn === col && sortOrder === 'asc') order = 'desc';
    setSortColumn(col);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const sorted = [...cases].sort((a, b) => {
    if (!sortColumn) return 0;
    let A = a[sortColumn], B = b[sortColumn];
    if (sortColumn === 'data_wplyniecia') {
      A = A ? new Date(A) : new Date(0);
      B = B ? new Date(B) : new Date(0);
      return sortOrder === 'asc' ? A - B : B - A;
    }
    A = A?.toString().toLowerCase() || '';
    B = B?.toString().toLowerCase() || '';
    if (A < B) return sortOrder === 'asc' ? -1 : 1;
    if (A > B) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // filtrowanie + paginacja
  const filtered = sorted.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.imie?.toLowerCase().includes(term) ||
      item.nazwisko?.toLowerCase().includes(term) ||
      item.telefon?.toLowerCase().includes(term) ||
      item.sprawa?.toLowerCase().includes(term) ||
      item.podjete_dzialanie?.toLowerCase().includes(term) ||
      (user?.role === 'admin' && item.user_name?.toLowerCase().includes(term))
    );
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Sprawy bieżące</h2>

      {/* Wyszukiwarka */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '10px', marginBottom: '20px'
      }}>
        <button
          onClick={() => { setIsSearchVisible(v => { if (v) setSearchTerm(''); return !v; }); }}
          style={searchToggleBtnStyle}
        >
          <FaSearch /> {isSearchVisible ? 'Ukryj wyszukiwanie' : 'Pokaż wyszukiwanie'}
        </button>
        {isSearchVisible && (
          <input
            type="text"
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={searchInputStyle}
          />
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
          <tr>
            <th style={headerStyle} onClick={() => handleSort('imie')}>
              Imię {sortColumn==='imie' && (sortOrder==='asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('nazwisko')}>
              Nazwisko {sortColumn==='nazwisko' && (sortOrder==='asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('telefon')}>
              Telefon {sortColumn==='telefon' && (sortOrder==='asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('data_wplyniecia')}>
              Data wpłynięcia {sortColumn==='data_wplyniecia' && (sortOrder==='asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('sprawa')}>
              Sprawa {sortColumn==='sprawa' && (sortOrder==='asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('podjete_dzialanie')}>
              Podjęte działanie {sortColumn==='podjete_dzialanie' && (sortOrder==='asc' ? '🔼' : '🔽')}
            </th>
            {user?.role === 'admin' && (
              <th style={headerStyle} onClick={() => handleSort('user_name')}>
                Użytkownik {sortColumn==='user_name' && (sortOrder==='asc' ? '🔼' : '🔽')}
              </th>
            )}
            <th style={actionColStyle}>
              <button onClick={openAdd} style={addBtnStyle}>
                <FaPlus /> 
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td
                colSpan={user?.role === 'admin' ? 8 : 7}
                style={{ textAlign: 'center', padding: 10 }}
              >
                Brak wyników
              </td>
            </tr>
          ) : (
            visible.map(item => (
              <tr
                key={item.id}
                style={{ ...rowStyle, cursor: 'pointer' }}
                onClick={() => openEdit(item.id)}
              >
                <td style={cellStyle}>{item.imie}</td>
                <td style={cellStyle}>{item.nazwisko}</td>
                <td style={cellStyle}>{item.telefon}</td>
                <td style={cellStyle}>{formatDate(item.data_wplyniecia)}</td>
                <td style={cellStyle}>
                  <div style={noteStyle}>{item.sprawa}</div>
                </td>
                <td style={cellStyle}>
                  <div style={noteStyle}>{item.podjete_dzialanie}</div>
                </td>
                {user?.role === 'admin' && (
                  <td style={cellStyle}>{item.user_name}</td>
                )}
                <td style={{ ...cellStyle, width: '30px', textAlign: 'center' }}>
                  <button
                    onClick={e => handleDelete(item.id, e)}
                    style={deleteBtnStyle}
                    title="Usuń wpis"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginacja */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
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

      {/* Modyfikacja */}
      <EditSprawaModal
        isOpen={isEditOpen}
        onRequestClose={closeEditModal}
        id={editingId}
        onUpdated={() => {
          closeEditModal();
          fetchCases();
        }}
      />

      {/* Dodawanie */}
      <Modal
        isOpen={isAdding}
        onRequestClose={closeAddModal}
        style={{
          content: {
            width: '800px',
            maxWidth: '80%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '12px',
            background: '#fff',
            inset: '0', margin: 'auto',
            position: 'relative', zIndex: '1001'
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
        }}
      >
        <button
          onClick={closeAddModal}
          style={{
            position: 'absolute', top: 10, right: 15,
            background: 'transparent', border: 'none',
            fontSize: 20, fontWeight: 'bold',
            cursor: 'pointer', color: '#999'
          }}
        >&times;</button>
        <TabInputSprawyBiezace
          setIsAdding={setIsAdding}
          fetchCases={fetchCases}
          editingSprawa={editingSprawa}
        />
      </Modal>
    </div>
  );
}