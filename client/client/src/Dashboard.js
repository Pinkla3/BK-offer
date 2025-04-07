import { getUser, removeToken } from './auth';
import AdminPanel from './AdminPanel';
import UserPanel from './UserPanel';
import ChangePassword from './ChangePassword';
import { useState, useEffect } from 'react';
import TabInputData from './TabInputData';
import TabViewData from './TabViewData';
import axios from 'axios';
import OffersTable from './Offers';

function Dashboard() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState('input');
  const [isAdding, setIsAdding] = useState(false);  // Stan do kontrolowania widoczności formularza
  const [editingEntry, setEditingEntry] = useState(null);  // Przechowuje dane edytowanego wpisu
  const [entries, setEntries] = useState([]);  // Przechowuje listę wpisów

  // Funkcja do pobierania danych z bazy
  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:3001/entries');
      setEntries(response.data);
    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    }
  };

  // Funkcja do edytowania wpisu
  const handleEdit = (entryId) => {
    axios.get(`http://localhost:3001/entries/${entryId}`)
      .then((response) => {
        setEditingEntry(response.data);  // Ustawienie danych edytowanego wpisu
        setIsAdding(true);  // Otwieramy formularz edycji
      })
      .catch((error) => {
        console.error('Błąd pobierania danych do edycji:', error);
      });
  };

  useEffect(() => {
    fetchEntries();  // Pobranie danych po załadowaniu komponentu
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      padding: 40,
      background: '#f0f4ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: 600,
        width: '100%',
        background: '#fff',
        borderRadius: 12,
        padding: 30,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => {
          removeToken();
          window.location.href = '/login';
        }}>Wyloguj</button>
  
        <h2 style={{ textAlign: 'center' }}>
          Witaj, {user?.role === 'admin' ? 'Administratorze' : 'Użytkowniku'}!
        </h2>

        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setActiveTab('input')}>➕ Wprowadzanie danych</button>
            <button onClick={() => setActiveTab('view')}>📄 Podgląd bazy</button>
            <button onClick={() => setActiveTab('password')}>🔐 Zmiana hasła</button>
            <button onClick={() => setActiveTab('offers')}> Oferty pracy</button>
          </div>

          {activeTab === 'input' && (
            <TabInputData
              setIsAdding={setIsAdding}
              fetchEntries={fetchEntries}  // Przekazanie funkcji do pobierania danych
              editingEntry={editingEntry}
            />
          )}
          {activeTab === 'view' && <TabViewData entries={entries} />}  {/* Przekazanie danych do TabViewData */}
          {activeTab === 'password' && <ChangePassword />}
          {activeTab === 'offers' && <OffersTable />}
        </div>
  
        {user?.role === 'admin' ? <AdminPanel /> : <UserPanel />}
      </div>
    </div>
  );
}

export default Dashboard;