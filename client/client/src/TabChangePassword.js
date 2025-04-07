import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
      const token = localStorage.getItem('token'); // zakładamy że zapisujesz token po logowaniu
      await axios.post('/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Hasło zostało zmienione!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Błąd zmiany hasła');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 20 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 20 }}>🔐 Zmiana hasła</h3>
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Stare hasło', value: oldPassword, set: setOldPassword, type: 'password' },
          { label: 'Nowe hasło', value: newPassword, set: setNewPassword, type: 'password' },
          { label: 'Potwierdź nowe hasło', value: confirmPassword, set: setConfirmPassword, type: 'password' }
        ].map(({ label, value, set, type }, idx) => (
          <div key={idx} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>{label}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => set(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Zmień hasło
        </button>
      </form>
    </div>
  );
}

export default TabChangePassword;