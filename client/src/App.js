import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import Dashboard from './Dashboard';
import { getUser, isTokenExpired, removeToken } from './auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ResetPassword from './ResetPassword';
import PublicFeedbackForm from './PublicFeedbackForm';
import { useEffect } from 'react';

function AppWrapper({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        removeToken();
        localStorage.removeItem('user_name');
        toast.info('Sesja wygasła, zaloguj się ponownie');
        navigate('/login');
      }
    }, 60000); // sprawdzanie co minutę

    return () => clearInterval(interval);
  }, [navigate]);

  return children;
}

function App() {
  const user = getUser();

  return (
    <Router>
      <AppWrapper>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/formularz-feedback/:token" element={<PublicFeedbackForm />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AppWrapper>
    </Router>
  );
}

export default App;