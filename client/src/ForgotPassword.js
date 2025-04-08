import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Ustawienie zmiennej API_BASE_URL z pliku .env (Create React App)
const API_BASE_URL = process.env.REACT_APP_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/reset-password`, { email });
      setNewPassword(res.data.newPassword);
      toast.success('Nowe hasło wygenerowane!');
    } catch {
      toast.error('Nie znaleziono użytkownika');
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

        <h2 style={{ textAlign: 'center' }}>Odzyskiwanie hasła</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Twój email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
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
            Resetuj hasło
          </button>
        </form>

        {newPassword && (
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <strong>Nowe hasło:</strong><br /> {newPassword}
          </div>
        )}

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

export default ForgotPassword;
