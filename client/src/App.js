
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import Dashboard from './Dashboard';
import { getUser } from './auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ResetPassword from './ResetPassword';
import PublicFeedbackForm from './PublicFeedbackForm';

function App() {

  const user = getUser();

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/formularz-feedback/:token" element={<PublicFeedbackForm />} /> {/* 👈 nowy route */}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}
export default App;
