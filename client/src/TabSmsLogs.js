import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

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
const cellStyle = { padding: 10, verticalAlign: 'top', fontSize: 14 };
const rowStyle = { borderBottom: '1px solid #eee' };
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

export default function TabSMSLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sent_at');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const pageSize = 20;
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    fetchLogs();
  }, [page, search, sortBy, order]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/sms-logs`, {
        params: { page, pageSize, search, sortBy, order },
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Błąd pobierania logów SMS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
    setPage(1);
  };

  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Logi SMS</h2>

      {/* Wyszukiwarka */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '10px', marginBottom: '20px'
      }}>
        <button
          onClick={() => { setIsSearchVisible(v => { if (v) setSearch(''); return !v; }); }}
          style={searchToggleBtnStyle}
        >
          <FaSearch /> {isSearchVisible ? 'Ukryj wyszukiwanie' : 'Pokaż wyszukiwanie'}
        </button>
        {isSearchVisible && (
          <input
            type="text"
            placeholder="Szukaj po numerze lub statusie..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={searchInputStyle}
          />
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
          <tr>
            <th style={headerStyle} onClick={() => handleSort('recipient_phone')}>
              Numer {sortBy === 'recipient_phone' && (order === 'ASC' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle}>Wiadomość</th>
            <th style={headerStyle} onClick={() => handleSort('status')}>
              Status {sortBy === 'status' && (order === 'ASC' ? '🔼' : '🔽')}
            </th>
            <th style={headerStyle}>ID SMSAPI</th>
            <th style={headerStyle} onClick={() => handleSort('sent_at')}>
              Data {sortBy === 'sent_at' && (order === 'ASC' ? '🔼' : '🔽')}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: 10 }}>
                Ładowanie...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: 10 }}>
                Brak wyników
              </td>
            </tr>
          ) : (
            logs.map(log => (
              <tr key={log.id} style={rowStyle}>
                <td style={cellStyle}>{log.recipient_phone}</td>
                <td style={{ ...cellStyle, maxWidth: 300 }} title={log.message}>
                  {log.message.length > 100 ? log.message.slice(0, 100) + '…' : log.message}
                </td>
                <td style={cellStyle}>{log.status}</td>
                <td style={cellStyle}>{log.smsapi_id}</td>
                <td style={cellStyle}>{new Date(log.sent_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginacja */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
          <button
            key={pg}
            onClick={() => setPage(pg)}
            style={{
              margin: '0 5px',
              padding: '8px 12px',
              borderRadius: '4px',
              border: pg === page ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: pg === page ? '#007bff' : '#fff',
              color: pg === page ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            {pg}
          </button>
        ))}
      </div>
    </div>
  );
}