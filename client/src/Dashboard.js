// Dashboard.js
import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { removeToken } from './auth';
import AdminPanel from './AdminPanel';
import UserPanel from './UserPanel';
import ChangePassword from './ChangePassword';
import TabInputData from './TabInputData';
import TabViewData from './TabViewData';
import OffersTable from './Offers';
import { FaPlus, FaDatabase, FaLock, FaBriefcase } from 'react-icons/fa';
import TabChangePassword from './TabChangePassword';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    color: #333;
  }
`;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 220px;
  padding: 30px 20px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: url('/images/background.png') left/cover;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(255,255,255,0.85);
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const SidebarButton = styled.button`
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: ${props => (props.$active ? '4px solid #007bff' : '4px solid transparent')};
  color: ${props => (props.$active ? '#007bff' : '#555')};
  transition: all 0.2s ease;
  &:hover {
    color: #007bff;
    border-left: 4px solid #007bff;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: url('/images/background.png');
  padding: 15px 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(255,255,255,0.85);
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #c0392b;
  }
`;

const Content = styled.main`
  flex: 1;
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entries, setEntries] = useState([]);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return console.warn('Brak tokenu');
  
    try {
      const response = await axios.get(`${API_BASE_URL}/api/userdb`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Odpowiedź z userdb:', response.data);
      if (response.data && response.data.user) {
        setUser(response.data.user);
      
      }
    } catch (error) {
      console.error('Błąd pobierania danych użytkownika:', error);
    }
  };

  const fetchEntries = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Brak tokenu JWT – użytkownik niezalogowany');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/entries`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEntries(response.data);
    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    }
  };

  const handleEdit = (entryId) => {
    axios.get(`${API_BASE_URL}/api/entries/${entryId}`)
      .then((response) => {
        setEditingEntry(response.data);
        setIsAdding(true);
      })
      .catch((error) => {
        console.error('Błąd pobierania danych do edycji:', error);
      });
  };

  useEffect(() => {
    fetchUser();
    fetchEntries();
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  let content;
  if (activeTab === 'input') {
    content = <TabInputData setIsAdding={setIsAdding} fetchEntries={fetchEntries} editingEntry={editingEntry} />;
  } else if (activeTab === 'view') {
    content = <TabViewData entries={entries} user={user}/>;
  } else if (activeTab === 'password') {
    content = <TabChangePassword />;
  } 

  return (
    <>
      <GlobalStyle />
      <DashboardContainer>
        <Sidebar>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/images/logo.jpg" alt="Logo" style={{ width: '100px' }} />
          </div>
          <SidebarButton $active={activeTab === 'input'} onClick={() => setActiveTab('input')}>
            <FaPlus size={18} /> Dodaj opiekunkę do bazy
          </SidebarButton>
          <SidebarButton $active={activeTab === 'view'} onClick={() => setActiveTab('view')}>
            <FaDatabase size={18} /> Podgląd bazy opiekunek
          </SidebarButton>
          <SidebarButton $active={activeTab === 'password'} onClick={() => setActiveTab('password')}>
            <FaLock size={18} /> Zmiana hasła
          </SidebarButton>
        </Sidebar>
        <MainArea>
          <Header>
            <UserInfo>
              <span>{user ? `Witaj, ${user.name}` : 'Użytkownik'}</span>
              <LogoutButton onClick={handleLogout}>Wyloguj</LogoutButton>
            </UserInfo>
          </Header>
          <Content>
            {content}
          </Content>
          {user?.role === 'admin' ? <AdminPanel /> : <UserPanel />}
        </MainArea>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;

