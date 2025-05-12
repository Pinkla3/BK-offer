import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Ustawienie zmiennej API_BASE_URL z pliku .env (Create React App)
const API_BASE_URL = process.env.REACT_APP_API_URL;

function TabChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return toast.error('Nowe hasło musi mieć min. 6 znaków');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Nowe hasła się nie zgadzają');
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/change-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Hasło zostało zmienione!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Błąd zmiany hasła');
    }
  };

  const containerStyle = {
    maxWidth: 400,
    margin: '0 auto',
    padding: 20,
    background: '#fff',
    borderRadius: 12,
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: '1.5rem',
    fontWeight: 600
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    outlineColor: '#007bff',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 600,
    marginBottom: 4,
    marginLeft: 3,
    fontSize: '0.9rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: 10,
    transition: 'background-color 0.3s'
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>Zmiana hasła</h3>
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Stare hasło', value: oldPassword, set: setOldPassword, type: 'password' },
          { label: 'Nowe hasło', value: newPassword, set: setNewPassword, type: 'password' },
          { label: 'Potwierdź nowe hasło', value: confirmPassword, set: setConfirmPassword, type: 'password' }
        ].map(({ label, value, set, type }, idx) => (
          <div key={idx} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => set(e.target.value)}
              style={inputStyle}
            />
          </div>
        ))}
        <button type="submit" style={buttonStyle}>
          Zmień hasło
        </button>
      </form>
    </div>
  );
}

export default TabChangePassword;
