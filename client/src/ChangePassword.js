import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getToken } from './auth';

function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    let error = '';
    if (field === 'newPassword' && value.length < 6) error = 'Nowe hasło musi mieć min. 6 znaków';
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.newPassword) return;

    try {
      await axios.post(
        'http://localhost:3001/change-password',
        form,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Hasło zmienione!');
      setForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Błąd przy zmianie hasła');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Zmiana hasła</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Stare hasło"
          value={form.oldPassword}
          onChange={e => handleChange('oldPassword', e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nowe hasło"
          value={form.newPassword}
          onChange={e => handleChange('newPassword', e.target.value)}
          style={{ borderColor: errors.newPassword ? 'red' : '#ccc' }}
          required
        />
        {errors.newPassword && <div style={{ color: 'red', fontSize: 12 }}>{errors.newPassword}</div>}
        <button type="submit">Zmień hasło</button>
      </form>
    </div>
  );
}

export default ChangePassword;