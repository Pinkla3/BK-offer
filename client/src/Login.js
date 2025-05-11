import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { setToken } from './auth';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error('Błąd dekodowania tokena', e);
    return null;
  }
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const expTime = decoded.exp * 1000;
        const currentTime = Date.now();
        if (expTime < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user_name');
          toast.info('Sesja wygasła, zaloguj się ponownie');
          navigate('/login');
        }
      }
    }
  }, [navigate]);

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

    setLoading(true);
    try {
const res = await axios.post('/api/login', form);
      if (res.data.token) {
        setToken(res.data.token);

        const decoded = decodeToken(res.data.token);
        console.log('Dekodowany token:', decoded);

        if (decoded && (decoded.name || decoded.email)) {
          const userName = decoded.name || decoded.email;
          localStorage.setItem('user_name', userName);
        }

        toast.success('Zalogowano');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        toast.error('Brak tokenu');
      }
    } catch (err) {
      console.error('Błąd logowania:', err);
      toast.error('Błędne dane logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url("/images/background.jfif")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
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
        boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/images/logo.jpg" alt="Logo" style={{ width: '100px' }} />
          <h2>Desk - twoje wirtualne biurko rekrutacyjne</h2>
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
              boxSizing: 'border-box',
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
              boxSizing: 'border-box',
            }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: 12 }}>{errors.password}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '12px',
              backgroundColor: loading ? '#999' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
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
