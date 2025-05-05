import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TabSMSLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sent_at');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sms-logs`, {
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

  useEffect(() => {
    fetchLogs();
  }, [page, search, sortBy, order]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Logi SMS</h2>

      <input
        type="text"
        placeholder="Szukaj po numerze lub statusie..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 px-3 py-2 border border-gray-300 rounded w-full md:w-1/2"
      />

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('recipient_phone')}>Numer</th>
              <th className="p-2">Wiadomość</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('status')}>Status</th>
              <th className="p-2">ID SMSAPI</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('sent_at')}>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4">Ładowanie...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">Brak wyników</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t">
                  <td className="p-2">{log.recipient_phone}</td>
                  <td className="p-2 truncate max-w-[300px]" title={log.message}>{log.message}</td>
                  <td className="p-2">{log.status}</td>
                  <td className="p-2">{log.smsapi_id}</td>
                  <td className="p-2">{new Date(log.sent_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacja */}
      <div className="flex justify-between items-center mt-4">
        <span>Strona {page} z {totalPages}</span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Poprzednia
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Następna
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabSMSLogs;
