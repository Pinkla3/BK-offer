import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Ustawienie zmiennej API_BASE_URL z pliku .env (Create React App)
const API_BASE_URL = process.env.REACT_APP_API_URL;

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    let error = '';
    if (field === 'name' && !value.trim()) error = 'Imię jest wymagane';
    if (field === 'email' && !value.includes('@')) error = 'Nieprawidłowy email';
    if (field === 'password' && value.length < 6) error = 'Hasło musi mieć min. 6 znaków';
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (form.email.includes('@')) {
        axios.get(`${API_BASE_URL}/check-email?email=${form.email}`)
          .then(res => {
            if (res.data.exists) {
              setErrors(prev => ({ ...prev, email: 'Email już istnieje' }));
            }
          });
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [form.email]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Imię jest wymagane';
    if (!form.email.includes('@')) newErrors.email = 'Nieprawidłowy email';
    if (form.password.length < 6) newErrors.password = 'Hasło musi mieć min. 6 znaków';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await axios.post(`${API_BASE_URL}/register`, form);
      toast.success('Zarejestrowano! Możesz się zalogować');
      navigate('/login');
    } catch {
      toast.error('Błąd rejestracji');
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

        <h2 style={{ textAlign: 'center' }}>Rejestracja</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Imię"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              border: errors.name ? '1px solid red' : '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
          {errors.name && <div style={{ color: 'red', fontSize: 12 }}>{errors.name}</div>}
  
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
  
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          >
            <option value="user">Użytkownik</option>
            <option value="admin">Administrator</option>
          </select>
  
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
              cursor: 'pointer'
            }}
          >
            Zarejestruj się
          </button>
        </form>
  
        <p style={{ marginTop: 10, textAlign: 'center' }}>
          Masz już konto?{" "}
          <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Zaloguj się
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
