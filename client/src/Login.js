import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { setToken } from './auth';

// Ustawienie zmiennej API_BASE_URL z pliku .env (Create React App)
const API_BASE_URL = process.env.REACT_APP_API_URL;

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  console.log("navigate funkcja:", navigate);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    let error = '';
    if (field === 'email' && !value.includes('@')) error = 'Nieprawidłowy email';
    if (field === 'password' && value.length < 6) error = 'Hasło musi mieć min. 6 znaków';
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.email || errors.password) return;
  
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, form);
      console.log('ODPOWIEDŹ Z BACKENDU:', res.data); // 👈 LOG
  
      if (res.data.token) {
        console.log('TOKEN JEST, PRZECHODZĘ NA DASHBOARD'); // 👈 LOG
        setToken(res.data.token);
        toast.success('Zalogowano');
        window.location.href = '/';
      } else {
        console.log('BRAK tokenu – nie przechodzę'); // 👈 LOG
        toast.error('Brak tokenu');
      }
    } catch (err) {
      console.error('Błąd logowania:', err);
      toast.error('Błędne dane logowania');
    }
  };

  return (
        <div style={{
          backgroundImage: 'url("/images/background.jfif")',
      backgroundSize: 'cover',       // skalowanie do wielkości kontenera
      backgroundRepeat: 'no-repeat', // wyłączenie powtarzania
      backgroundPosition: 'center',  // wyśrodkowanie obrazu     
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        boxSizing: 'border-box'
      }}>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <img src="/images/logo.jpg" alt="Logo" style={{ width: '100px' }} />
    <h2 style={{ textAlign: 'center' }}>BK-offer ver.1.0 </h2>
  </div> 

        <h2 style={{ textAlign: 'center' }}>Logowanie</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              border: errors.email ? '1px solid red' : '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
          {errors.email && <div style={{ color: 'red', fontSize: 12 }}>{errors.email}</div>}
  
          <input
            type="password"
            placeholder="Hasło"
            value={form.password}
            onChange={e => handleChange('password', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              border: errors.password ? '1px solid red' : '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: 12 }}>{errors.password}</div>}
  
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '12px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            Zaloguj się
          </button>
        </form>
        <p style={{ marginTop: 10 }}>
          Nie masz konta? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/register')}>Zarejestruj się</span>
        </p>
        <p>
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>Zapomniałeś hasła?</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
