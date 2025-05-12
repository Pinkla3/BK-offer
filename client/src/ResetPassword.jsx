import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function ResetPassword() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Pobieramy token z URL (np. ?token=abc123)
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    let error = '';
    if (field === 'newPassword' && value.length < 6) {
      error = 'Hasło musi mieć min. 6 znaków';
    }
    if (field === 'confirmPassword' && value !== form.newPassword) {
      error = 'Hasła muszą być zgodne';
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Dodatkowa walidacja
    if (form.newPassword !== form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Hasła muszą być zgodne',
      }));
      return;
    }
    if (errors.newPassword || errors.confirmPassword) return;

    try {
      const response = await axios.post(`/api/update-password`, {
        token,
        newPassword: form.newPassword,
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error('Błąd przy resetowaniu hasła:', error);
      toast.error(
        error.response?.data?.message || 'Błąd przy resetowaniu hasła'
      );
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/images/background.jfif")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/images/logo.jpg" alt="Logo" style={{ width: '100px' }} />
          <h2 style={{ textAlign: 'center' }}>Desk - twoje wirtualne biurko rekrutacyjne</h2>
        </div>
        <h2 style={{ textAlign: 'center' }}>Reset hasła</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="password"
            placeholder="Nowe hasło"
            value={form.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              border: errors.newPassword
                ? '1px solid red'
                : '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          {errors.newPassword && (
            <div style={{ color: 'red', fontSize: 12 }}>
              {errors.newPassword}
            </div>
          )}
          <input
            type="password"
            placeholder="Powtórz nowe hasło"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              border: errors.confirmPassword
                ? '1px solid red'
                : '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          {errors.confirmPassword && (
            <div style={{ color: 'red', fontSize: 12 }}>
              {errors.confirmPassword}
            </div>
          )}
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
              boxSizing: 'border-box',
            }}
          >
            Zresetuj hasło
          </button>
        </form>
        <p style={{ marginTop: 10, textAlign: 'center' }}>
          <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Powrót do logowania
          </span>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;