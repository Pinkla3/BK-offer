import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { removeToken } from './auth';
import AdminPanel from './AdminPanel';
import UserPanel from './UserPanel';
import TabInputData from './TabInputData';
import TabViewData from './TabViewData';
import TabChangePassword from './TabChangePassword';
import TabSprawyBiezace from './TabSprawyBiezace';
import TabInputSprawyBiezace from './TabInputSprawyBiezace';
import TabFeedback from './TabFeedback';
import TabFeedbackView from './TabFeedbackView';
import { FaPlus, FaDatabase, FaLock, FaClipboardList, FaTag } from 'react-icons/fa';
import TabSmsLogs from './TabSmsLogs';
import TabSendSms from './TabSendSms';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

const GlobalStyle = createGlobalStyle`
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; color: #333; }
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
  & > * { position: relative; z-index: 1; }
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
  border-left: ${p=>p.$active?'4px solid #007bff':'4px solid transparent'};
  color: ${p=>p.$active?'#007bff':'#555'};
  transition: all .2s;
  &:hover { color:#007bff; border-left:4px solid #007bff; }
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
  position: relative;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(255,255,255,0.85);
    z-index: 0;
  }
  & > * { position: relative; z-index: 1; }
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
  transition: background .2s;
  &:hover { background:#c0392b; }
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [entries, setEntries] = useState([]);
  const [feedbackSelected, setFeedbackSelected] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/userdb`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('Błąd pobierania danych użytkownika:', err);
    }
  };

  const fetchEntries = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data);
    } catch (err) {
      console.error('Błąd pobierania wpisów:', err);
    }
  };

  const handleAddedCaregiver = async () => {
    await fetchEntries();
    setActiveTab('view');
  };

  useEffect(() => {
    fetchUser();
    fetchEntries();
  }, []);

  useEffect(() => {
    const handleGoToFeedbackList = () => {
      setFeedbackSelected(null);
      setActiveTab('responses');
    };
  
    window.addEventListener('goToFeedbackList', handleGoToFeedbackList);
    return () => window.removeEventListener('goToFeedbackList', handleGoToFeedbackList);
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  const handleFeedbackListClick = () => {
    window.dispatchEvent(new CustomEvent('feedbackBack'));
    setActiveTab('responses');
  };

  let content;
  switch (activeTab) {
    case 'input':
      content = <TabInputData setIsAdding={() => {}} fetchEntries={handleAddedCaregiver} editingEntry={null} />;
      break;
    case 'view':
      content = <TabViewData entries={entries} user={user} />;
      break;
    case 'cases':
      content = <TabSprawyBiezace />;
      break;
    case 'add-case':
      content = <TabInputSprawyBiezace setIsAdding={() => setActiveTab('cases')} fetchCases={fetchEntries} editingSprawa={null} />;
      break;
    case 'feedback':
      content = <TabFeedback />;
      break;
      case 'responses':
        content = (
          <TabFeedbackView
            selected={feedbackSelected}
            setSelected={setFeedbackSelected}
            resetSelected={() => setFeedbackSelected(null)}
          />
        );
        break;
        case 'sendSms':
  content = <TabSendSms />;
  break;
    case 'password':
      content = <TabChangePassword />;
      break;
    default:
      content = null;
      case 'smsLogs':
  content = <TabSmsLogs />;
  break;
  }

  return (
    <>
      <GlobalStyle />
      <DashboardContainer>
        <Sidebar>
          {/* logo */}
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img src="/images/logo.jpg" alt="Logo" style={{ width: '100px' }} />
          </div>
          {/* sidebar buttons */}
          <SidebarButton $active={activeTab==='input'} onClick={()=>setActiveTab('input')}><FaPlus size={18}/> Dodaj opiekunkę</SidebarButton>
          <SidebarButton $active={activeTab==='view'} onClick={()=>setActiveTab('view')}><FaDatabase size={18}/> Podgląd opiekunek</SidebarButton>
          <SidebarButton $active={activeTab==='add-case'} onClick={()=>setActiveTab('add-case')}><FaPlus size={18}/> Dodaj bieżącą sprawę</SidebarButton>
          <SidebarButton $active={activeTab==='cases'} onClick={()=>setActiveTab('cases')}><FaClipboardList size={18}/>Podgląd spraw bieżących</SidebarButton>
          <SidebarButton $active={activeTab==='feedback'} onClick={()=>setActiveTab('feedback')}><FaPlus size={18}/> Dodaj feedback</SidebarButton>
          <SidebarButton $active={activeTab==='responses'} onClick={handleFeedbackListClick}><FaTag size={18}/> Podgląd feedbacków</SidebarButton>
          <SidebarButton $active={activeTab==='sendSms'} onClick={()=>setActiveTab('sendSms')}>
  <FaTag size={18}/> Wyślij SMS
</SidebarButton>
          <SidebarButton $active={activeTab==='password'} onClick={()=>setActiveTab('password')}><FaLock size={18}/> Zmiana hasła</SidebarButton>
          {user?.role === 'admin' && (
  <SidebarButton $active={activeTab === 'smsLogs'} onClick={() => setActiveTab('smsLogs')}>
    <FaClipboardList size={18} /> Logi SMS
  </SidebarButton>
)}
        </Sidebar>

        <MainArea>
          <Header>
            <UserInfo>
              {user ? `Witaj, ${user.name}` : 'Użytkownik'}
              <LogoutButton onClick={handleLogout}>Wyloguj</LogoutButton>
            </UserInfo>
          </Header>
          <Content>
            {content}
          </Content>
          {user?.role==='admin' ? <AdminPanel/> : <UserPanel/>}
        </MainArea>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;