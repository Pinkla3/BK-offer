// TabInputSprawyBiezace.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function TabInputSprawyBiezace({
  setIsAdding,
  fetchCases,
  editingSprawa
}) {
  const [form, setForm] = useState({
    imie: '',
    nazwisko: '',
    telefon: '',
    data_wplyniecia: '',
    sprawa: '',
    podjete_dzialanie: ''
  });

  useEffect(() => {
    if (!editingSprawa) return;
    setForm({
      imie: editingSprawa.imie || '',
      nazwisko: editingSprawa.nazwisko || '',
      telefon: editingSprawa.telefon || '',
      data_wplyniecia: editingSprawa.data_wplyniecia
        ? editingSprawa.data_wplyniecia.slice(0, 10)
        : '',
      sprawa: editingSprawa.sprawa || '',
      podjete_dzialanie: editingSprawa.podjete_dzialanie || ''
    });
  }, [editingSprawa]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      let { data_wplyniecia } = form;
      // jeżeli data pusta → ustaw dzisiejszą
      if (!data_wplyniecia) {
        data_wplyniecia = new Date().toISOString().slice(0, 10);
      }
      const payload = { ...form, data_wplyniecia };
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingSprawa) {
        await axios.put(
          `/api/sprawy-biezace/${editingSprawa.id}`,
          payload,
          config
        );
        toast.success('Zaktualizowano sprawę bieżącą');
      } else {
        await axios.post(
          `/api/sprawy-biezace`,
          payload,
          config
        );
        toast.success('Dodano sprawę bieżącą');
      }

      fetchCases();
      setIsAdding(false);
      setForm({
        imie: '',
        nazwisko: '',
        telefon: '',
        data_wplyniecia: '',
        sprawa: '',
        podjete_dzialanie: ''
      });
    } catch (err) {
      console.error('Błąd zapisu sprawy:', err);
      toast.error('Błąd zapisu sprawy bieżącej');
    }
  };

  return (
    <div style={{
      padding: '5px',
      width: '100%',
      maxWidth: '800px',
      margin: '40px auto',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        textAlign: 'center',
        padding: '12px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '8px 8px 0 0',
        margin: 0
      }}>
        {editingSprawa ? 'Edycja sprawy bieżącej' : 'Dodaj sprawę bieżącą'}
      </h2>

      {/* noValidate wyłącza wszelką wbudowaną walidację */}
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '0 0 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Imię</label>
            <input
              type="text"
              placeholder="Imię"
              value={form.imie}
              onChange={e => handleChange('imie', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Nazwisko</label>
            <input
              type="text"
              placeholder="Nazwisko"
              value={form.nazwisko}
              onChange={e => handleChange('nazwisko', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Telefon</label>
            <input
              type="text"
              placeholder="Telefon"
              value={form.telefon}
              onChange={e => handleChange('telefon', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data wpłynięcia</label>
            <input
              type="date"
              value={form.data_wplyniecia}
              onChange={e => handleChange('data_wplyniecia', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Sprawa</label>
          <textarea
            rows={3}
            placeholder="W jakiej sprawie dzwoni opiekunka?"
            value={form.sprawa}
            onChange={e => handleChange('sprawa', e.target.value)}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Podjęte działanie</label>
          <textarea
            rows={3}
            placeholder="Jakie działania zostały / zostaną wykonane?"
            value={form.podjete_dzialanie}
            onChange={e => handleChange('podjete_dzialanie', e.target.value)}
            style={textareaStyle}
          />
        </div>

        <button
          type="submit"
          style={submitBtnStyle}
        >
          {editingSprawa ? 'Zapisz zmiany' : 'Dodaj sprawę'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical'
};

const submitBtnStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};