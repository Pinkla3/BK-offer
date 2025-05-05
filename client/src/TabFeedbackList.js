import { FaSearch, FaTrash, FaPlus } from 'react-icons/fa';
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import TabFeedback from './TabFeedback';

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

const addBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#28a745',
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

const headerStyle = {
  padding: 10,
  color: '#fff',
  fontWeight: 600,
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0',
  minWidth: 120,
  cursor: 'pointer',
  userSelect: 'none',
};

const cellStyle = {
  padding: 10,
  verticalAlign: 'top',
  fontSize: 14,
};

const rowStyle = {
  borderBottom: '1px solid #eee',
  cursor: 'pointer',
};

const deleteBtnStyle = {
  backgroundColor: 'red',
  color: '#fff',
  border: 'none',
  width: '30px',
  height: '30px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px'
};


const getLastEditInfo = (entry) => {
  try {
    const edits = JSON.parse(entry.edit_history || '[]');
    if (!Array.isArray(edits) || edits.length === 0) return null;
    const last = edits[edits.length - 1];
    const match = last.match(/przez ([^ ]+) dnia (\d{2})\.(\d{2})\.(\d{4})/);
    if (!match) return null;
    const [, user, dd, mm, yyyy] = match;
    return { user, date: `${dd}.${mm}.${yyyy}` };
  } catch {
    return null;
  }
};

const ITEMS_PER_PAGE = 10;

const TabFeedbackList = ({ responses: initialResponses, onSelect, onAdd }) => {
  const [responses, setResponses] = useState(initialResponses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tabResponses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResponses(res.data);
        console.log('🔁 Odświeżono dane feedbacków');
      } catch (err) {
        console.warn('Błąd odświeżania feedbacków:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tabResponses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Wpis usunięty');
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error('Błąd podczas usuwania wpisu');
    }
  };

  const filtered = responses.filter(r => {
    const t = searchTerm.toLowerCase();
    const created = new Date(r.created_at).toLocaleDateString('pl-PL');
    const lastEdit = getLastEditInfo(r);
    const lastEditStr = lastEdit ? lastEdit.date : '';

    return (
      r.caregiver_first_name?.toLowerCase().includes(t) ||
      r.caregiver_last_name?.toLowerCase().includes(t) ||
      r.patient_first_name?.toLowerCase().includes(t) ||
      r.patient_last_name?.toLowerCase().includes(t) ||
      r.caregiver_phone?.toLowerCase().includes(t) ||
      created.includes(t) ||
      lastEditStr.includes(t)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let A, B;
    if (sortColumn === 'created_at') {
      A = new Date(a.created_at);
      B = new Date(b.created_at);
    } else if (sortColumn === 'last_edit') {
      const infoA = getLastEditInfo(a);
      const infoB = getLastEditInfo(b);
      A = infoA ? new Date(infoA.date.split('.').reverse().join('-')) : new Date(0);
      B = infoB ? new Date(infoB.date.split('.').reverse().join('-')) : new Date(0);
    } else if (sortColumn) {
      A = (a[sortColumn] || '').toString().toLowerCase();
      B = (b[sortColumn] || '').toString().toLowerCase();
    } else {
      return 0;
    }

    if (A < B) return sortOrder === 'asc' ? -1 : 1;
    if (A > B) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const currentData = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Feedbacki opiekunek</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => {
            setIsSearchVisible(v => {
              if (v) setSearchTerm('');
              return !v;
            });
          }}
          style={searchToggleBtnStyle}
        >
          <FaSearch /> {isSearchVisible ? 'Ukryj wyszukiwanie' : 'Pokaż wyszukiwanie'}
        </button>
        {isSearchVisible && (
          <input
            type="text"
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={searchInputStyle}
          />
        )}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
          <tr>
            <th style={headerStyle} onClick={() => handleSort('caregiver_last_name')}>
              Opiekunka {sortColumn === 'caregiver_last_name' && (sortOrder === 'asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('patient_last_name')}>
              Pacjent {sortColumn === 'patient_last_name' && (sortOrder === 'asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('caregiver_phone')}>
              Telefon {sortColumn === 'caregiver_phone' && (sortOrder === 'asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('created_at')}>
              Data utworzenia {sortColumn === 'created_at' && (sortOrder === 'asc' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle} onClick={() => handleSort('last_edit')}>
              Ostatnia edycja {sortColumn === 'last_edit' && (sortOrder === 'asc' ? '🔼' : '🔽')}
            </th>
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
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 10 }}>Brak wyników</td>
            </tr>
          ) : (
            currentData.map(r => {
              const lastEditInfo = getLastEditInfo(r);
              return (
                <tr key={r.id} style={rowStyle} onClick={() => onSelect(r)}>
                  <td style={cellStyle}>{r.caregiver_first_name} {r.caregiver_last_name}</td>
                  <td style={cellStyle}>{r.patient_first_name} {r.patient_last_name}</td>
                  <td style={cellStyle}>{r.caregiver_phone}</td>
                  <td style={cellStyle}>{new Date(r.created_at).toLocaleDateString('pl-PL')}</td>
                  <td style={cellStyle}>{lastEditInfo ? `${lastEditInfo.user}, ${lastEditInfo.date}` : '—'}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <button onClick={(e) => handleDelete(r.id, e)} style={deleteBtnStyle} title="Usuń">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })
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

      <Modal
        isOpen={isAdding}
        onRequestClose={() => setIsAdding(false)}
        style={{
          content: {
            width: '800px',
            maxWidth: '90%',
            maxHeight: '90vh',
            minHeight: '50vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '12px',
            background: '#fff',
            inset: '0',
            margin: 'auto',
            position: 'relative',
            zIndex: 1001
          },
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000
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
        >&times;</button>

<TabFeedback
onSuccess={(entry) => {
  onAdd?.(entry);
  setResponses(prev => [entry, ...prev]);
  toast.success('Feedback dodany');
  setIsAdding(false);
}}
/>
      </Modal>
    </div>
  );
};

export default TabFeedbackList;
