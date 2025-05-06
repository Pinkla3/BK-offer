require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');

const pool = require('./db'); // import puli połączeń mysql2

const app = express();
const port = 3009;

// CORS + JSON
app.use(cors({
  origin: ['http://localhost:3008', 'https://desk.berlin-opiekunki.pl', 'https://bk-offer.pl'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(bodyParser.json());
app.use(express.json());


// ---------------------- JWT MIDDLEWARE ----------------------
// Weryfikacja JWT, obsługa wygaśnięcia tokenu
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Brak tokenu' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token wygasł' });
    }
    return res.status(401).json({ error: 'Token nieprawidłowy' });
  }
}
// ---------------------- INNE ENDPOINTY -------------------------

// Przykładowy router dla lockstepOffers
const lockstepOffersRouter = require("./routes/lockstepOffers");
app.use("/api/lockstep-offers", lockstepOffersRouter);

app.post('/api/register', async (req, res) => {
  const { name, email, password, role, adminCode } = req.body;
  // Domyślnie rejestrujemy jako "user"
  let userRole = 'user';
  
  // Jeżeli użytkownik chce się zarejestrować jako admin (role === 'admin'),
  // sprawdzamy, czy podany kod admina jest poprawny.
  if (role === 'admin') {
    // Oczekiwany kod admina pobierany z pliku .env
    const expectedAdminCode = process.env.ADMIN_CODE;
    
    if (adminCode !== expectedAdminCode) {
      return res.status(403).json({ error: 'Nieprawidłowy kod admina' });
    }
    // Jeśli kod się zgadza – ustalamy rolę admina
    userRole = 'admin';
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [name, email, hashedPassword, userRole]);
    res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
  } catch (err) {
    res.status(500).json({ error: 'Email już istnieje lub błąd serwera' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await pool.query(sql, [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    
    // Debug: wyświetlenie JWT_SECRET (usuń w produkcji)
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Zalogowano', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Błąd logowania' });
  }
});

app.get('/api/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Nieprawidłowy adres e-mail' });
  }
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    res.json({ exists: results.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera przy sprawdzaniu e-maila' });
  }
});

app.get('/api/userdb', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokenu' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const [results] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);

    if (results.length === 0) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });

    res.json({ user: results[0] });
  } catch (err) {
    console.error('Błąd przy pobieraniu danych użytkownika:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});
app.delete('/api/entries/:id', async (req, res) => {
  const entryId = req.params.id;
  try {
    await pool.query('DELETE FROM entries WHERE id = ?', [entryId]);
    res.json({ message: 'Wpis usunięty' });
  } catch (err) {
    console.error('Błąd przy usuwaniu:', err);
    res.status(500).json({ error: 'Błąd serwera przy usuwaniu wpisu' });
  }
});

// Endpoint do zmiany hasła (podając stare hasło)
app.post('/api/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Brak tokenu' });
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token nieprawidłowy' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const [results] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (results.length === 0) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    
    const user = results[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Stare hasło nieprawidłowe' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    res.json({ message: 'Hasło zostało zmienione' });
  } catch (error) {
    console.error('Błąd przy zmianie hasła:', error);
    res.status(500).json({ error: 'Błąd przy zmianie hasła', details: error.message });
  }
});

// Endpointy związane z wpisami (pobieranie, dodawanie, edycja, usuwanie)
app.get('/api/entries', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokenu' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const isAdmin = decoded.role === 'admin';

    let results;
    if (isAdmin) {
      [results] = await pool.query(`
        SELECT entries.*, users.name AS user_name 
        FROM entries 
        JOIN users ON entries.user_id = users.id 
        ORDER BY entries.id DESC
      `);
    } else {
      [results] = await pool.query('SELECT * FROM entries WHERE user_id = ? ORDER BY id DESC', [userId]);
    }

    res.json(results);
  } catch (err) {
    console.error('Błąd przy pobieraniu danych:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/entries', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokenu' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const {
      imie, nazwisko, jezyk, telefon, fs, nr, do_opieki,
      dyspozycyjnosc, oczekiwania, referencje,
      ostatni_kontakt, notatka, proponowane_zlecenie
    } = req.body;

    const sql = `
      INSERT INTO entries (
        imie, nazwisko, jezyk, telefon, fs, nr, do_opieki,
        dyspozycyjnosc, oczekiwania, referencje,
        ostatni_kontakt, notatka, proponowane_zlecenie, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      imie, nazwisko, jezyk, telefon, fs, nr, do_opieki,
      dyspozycyjnosc, oczekiwania, referencje,
      ostatni_kontakt, notatka, proponowane_zlecenie, userId
    ];

    await pool.query(sql, values);
    res.status(201).json({ message: 'Wpis dodany pomyślnie' });
  } catch (err) {
    console.error('Błąd zapisu wpisu:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.put('/api/entries/:id', async (req, res) => {
  const id = req.params.id;
  const {
    imie, nazwisko, jezyk, fs, nr, do_opieki,
    dyspozycyjnosc, oczekiwania, referencje,
    ostatni_kontakt, notatka, telefon, proponowane_zlecenie
  } = req.body;

  const dyspozycyjnoscValue = dyspozycyjnosc === '' ? null : dyspozycyjnosc;
  const ostatniKontaktValue = ostatni_kontakt === '' ? null : ostatni_kontakt;

  const sql = `
    UPDATE entries SET 
      imie = ?, nazwisko = ?, jezyk = ?, fs = ?, nr = ?,
      do_opieki = ?, dyspozycyjnosc = ?, oczekiwania = ?,
      referencje = ?, ostatni_kontakt = ?, notatka = ?, telefon = ?, proponowane_zlecenie = ?
    WHERE id = ?
  `;

  const values = [
    imie, nazwisko, jezyk, fs, nr,
    do_opieki, dyspozycyjnoscValue, oczekiwania,
    referencje, ostatniKontaktValue, notatka, telefon, proponowane_zlecenie, id
  ];

  try {
    await pool.query(sql, values);
    res.json({ message: 'Dane zaktualizowane' });
  } catch (err) {
    console.error('Błąd edycji:', err);
    res.status(500).json({ error: 'Błąd podczas edycji' });
  }
});

// ---------------------- SPRAWY BIEŻĄCE ----------------------

// Lista spraw — admin widzi wszystkie, user tylko swoje
app.get('/api/sprawy-biezace', authenticate, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      [rows] = await pool.query(`
        SELECT 
          s.id,
          s.imie,
          s.nazwisko,
          s.telefon,
          s.data_wplyniecia,
          s.sprawa,
          s.podjete_dzialanie,
          u.name AS user_name
        FROM sprawy_biezace s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.data_wplyniecia DESC
      `);
    } else {
      [rows] = await pool.query(`
        SELECT 
          s.id,
          s.imie,
          s.nazwisko,
          s.telefon,
          s.data_wplyniecia,
          s.sprawa,
          s.podjete_dzialanie,
          u.name AS user_name
        FROM sprawy_biezace s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.data_wplyniecia DESC
      `, [req.user.id]);
    }
    res.json(rows);
  } catch (err) {
    console.error('Błąd przy pobieraniu listy spraw bieżących:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pojedyncza sprawa — sprawdzamy dostęp
app.get('/api/sprawy-biezace/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [[row]] = await pool.query(`
      SELECT id, imie, nazwisko, telefon,
             data_wplyniecia, sprawa, podjete_dzialanie, user_id
      FROM sprawy_biezace WHERE id = ?
    `, [id]);
    if (!row) {
      return res.status(404).json({ error: 'Nie znaleziono sprawy' });
    }
    if (req.user.role !== 'admin' && row.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Dodawanie sprawy — zapisujemy user_id
app.post('/api/sprawy-biezace', authenticate, async (req, res) => {
  let { imie, nazwisko, telefon, data_wplyniecia, sprawa, podjete_dzialanie } = req.body;
  
  // jeżeli użytkownik nie podał daty, ustaw dzisiejszą
  if (!data_wplyniecia) {
    data_wplyniecia = new Date().toISOString().slice(0,10);
  }

  try {
    await pool.query(
      `INSERT INTO sprawy_biezace
        (imie, nazwisko, telefon, data_wplyniecia, sprawa, podjete_dzialanie, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [imie, nazwisko, telefon, data_wplyniecia, sprawa, podjete_dzialanie, req.user.id]
    );
    res.status(201).json({ message: 'Dodano sprawę bieżącą' });
  } catch (err) {
    console.error('Błąd podczas dodawania sprawy:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});
// Edycja sprawy — tylko właściciel lub admin
app.put('/api/sprawy-biezace/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  let { imie, nazwisko, telefon, data_wplyniecia, sprawa, podjete_dzialanie } = req.body;

  // jeśli data pusta → ustaw dzisiejszą
  if (!data_wplyniecia) {
    data_wplyniecia = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  }

  try {
    const [result] = await pool.query(
      `UPDATE sprawy_biezace SET
         imie = ?, nazwisko = ?, telefon = ?, data_wplyniecia = ?, sprawa = ?, podjete_dzialanie = ?
       WHERE id = ?`,
      [imie, nazwisko, telefon, data_wplyniecia, sprawa, podjete_dzialanie, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono sprawy' });
    }
    res.json({ message: 'Zaktualizowano sprawę' });
  } catch (err) {
    console.error('Błąd podczas aktualizacji sprawy:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Usuwanie sprawy — tylko właściciel lub admin
app.delete('/api/sprawy-biezace/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== 'admin') {
      const [[orig]] = await pool.query(
        'SELECT user_id FROM sprawy_biezace WHERE id = ?', [id]
      );
      if (!orig || orig.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak dostępu' });
      }
    }
    const [result] = await pool.query(
      'DELETE FROM sprawy_biezace WHERE id = ?', [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono sprawy' });
    }
    res.json({ message: 'Usunięto sprawę bieżącą' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});


// ---------------------- RESET HASŁA ----------------------

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (!users.length) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    await pool.execute(
      'INSERT INTO password_resets (email,token,created_at) VALUES (?,?,NOW())',
      [email, token]
    );
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Resetowanie hasła',
      text: `Kliknij: ${link}\nLink ważny 1h.`
    });
    res.json({ message: 'Link resetujący został wysłany' });
  } catch {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/update-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [recs] = await pool.execute(
      'SELECT email,created_at FROM password_resets WHERE token = ?', [token]
    );
    if (!recs.length) {
      return res.status(400).json({ error: 'Token nieprawidłowy lub wygasł' });
    }
    const age = (Date.now() - new Date(recs[0].created_at)) / 1000;
    if (age > 3600) {
      return res.status(400).json({ error: 'Token wygasł' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?', [hashed, recs[0].email]
    );
    await pool.execute(
      'DELETE FROM password_resets WHERE token = ?', [token]
    );
    res.json({ message: 'Hasło zostało zaktualizowane' });
  } catch {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});
app.post('/api/tabResponses', authenticate, async (req, res) => {
  const {
    caregiverFirstName, caregiverLastName, caregiverPhone,
    patientFirstName, patientLastName,
    q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, notes
  } = req.body;

  try {
    const userId = req.user.id;
    const publicToken = crypto.randomBytes(16).toString('hex');

    const sql = `
      INSERT INTO tab_responses (
        caregiver_first_name, caregiver_last_name, caregiver_phone,
        patient_first_name, patient_last_name,
        q1, q2, q3, q4, q5, q6, q7, q8, q9, q10,
        notes, user_id, public_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      caregiverFirstName, caregiverLastName, caregiverPhone,
      patientFirstName, patientLastName,
      q1, q2, q3, q4, q5, q6, q7, q8, q9, q10,
      notes, userId, publicToken
    ];

    const [result] = await pool.query(sql, params);
    const insertedId = result.insertId;

    const [[inserted]] = await pool.query(`
      SELECT tab_responses.*, users.name AS user_name
      FROM tab_responses
      JOIN users ON tab_responses.user_id = users.id
      WHERE tab_responses.id = ?
    `, [insertedId]);

    res.status(201).json(inserted);

  } catch (err) {
    console.error('Błąd zapisu feedback:', err);
    res.status(500).json({ error: 'Błąd serwera podczas zapisu feedback.' });
  }
});

// Pobierz wszystkie odpowiedzi (admin widzi wszystkie, user tylko swoje)
app.get('/api/tabResponses', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const {
      search = '',
      sortBy = 'tab_responses.id',
      order = 'DESC'
    } = req.query;

    const searchSql = `%${search}%`;

    const whereClause = isAdmin
      ? ''
      : 'WHERE tab_responses.user_id = ?';

    const searchConditions = `
      (${[
        'tab_responses.caregiver_first_name',
        'tab_responses.caregiver_last_name',
        'tab_responses.patient_first_name',
        'tab_responses.patient_last_name',
        'tab_responses.caregiver_phone'
      ].map(field => `${field} LIKE ?`).join(' OR ')})
    `;

    const finalWhere = whereClause
      ? `${whereClause} AND ${searchConditions}`
      : `WHERE ${searchConditions}`;

    const sortColumn = [
      'tab_responses.id',
      'tab_responses.created_at',
      'tab_responses.caregiver_first_name',
      'tab_responses.patient_first_name',
      'tab_responses.caregiver_phone'
    ].includes(sortBy) ? sortBy : 'tab_responses.id';

    const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT tab_responses.*, users.name AS user_name
      FROM tab_responses
      JOIN users ON tab_responses.user_id = users.id
      ${finalWhere}
      ORDER BY ${sortColumn} ${sortDirection}
    `;

    const searchParams = Array(5).fill(searchSql);
    const queryParams = isAdmin ? searchParams : [userId, ...searchParams];

    const [rows] = await pool.query(query, queryParams);

    res.json(rows);
  } catch (err) {
    console.error('Błąd pobierania odpowiedzi:', err);
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu odpowiedzi.' });
  }
});
app.post('/api/translate', authenticate, async (req, res) => {
  const { texts, source='pl', target='de' } = req.body;
  try {
    const translations = [];
    for (const text of texts) {
      const r = await axios.post(
        'http://hosting.poznysz.eu:5000/translate',
        { q: text, source, target, format: 'text' },
        { headers: {'Content-Type':'application/json'} }
      );
      // Jeżeli proxy zwraca string lub obiekt z różnymi kluczami:
      const t = typeof r.data === 'string'
        ? r.data
        : r.data.translatedText    // LibreTranslate
          || r.data.translation    // inne proxy
          || r.data.translated_text
          || '';
      translations.push(t);
    }
    return res.json({ translations });
  } catch (err) {
    console.error('Translate error:', err.response?.data || err.message);
    return res.status(502).json({ error: 'Błąd tłumaczenia' });
  }
});

app.patch('/api/tabResponses/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const now = new Date();

    // Ręczne formatowanie daty i godziny
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${dd}.${mm}.${yyyy}, ${hh}:${min}:${ss}`;
    const [[userRow]] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const userName = userRow ? userRow.name : 'nieznany użytkownik';
    const historyEntry = `Edytowano przez ${userName} dnia ${formattedDateTime}`;

    const [rows] = await pool.query('SELECT edit_history FROM tab_responses WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono odpowiedzi' });
    }

    const current = rows[0];
    let updatedHistory = [];

    if (current.edit_history) {
      try {
        updatedHistory = JSON.parse(current.edit_history);
        if (!Array.isArray(updatedHistory)) updatedHistory = [];
      } catch {
        updatedHistory = [];
      }
    }

    updatedHistory.push(historyEntry);

    const [result] = await pool.query(`
      UPDATE tab_responses SET
        caregiver_first_name = ?, caregiver_last_name = ?, caregiver_phone = ?,
        patient_first_name = ?, patient_last_name = ?,
        q1 = ?, q2 = ?, q3 = ?, q4 = ?, q5 = ?,
        q6 = ?, q7 = ?, q8 = ?, q9 = ?, q10 = ?,
        notes = ?, q1_de = ?, q2_de = ?, q3_de = ?, q4_de = ?, q5_de = ?,
        q6_de = ?, q7_de = ?, q8_de = ?, q9_de = ?, q10_de = ?,
        notes_de = ?, user_name = ?, edit_history = ?
      WHERE id = ?
    `, [
      updates.caregiver_first_name, updates.caregiver_last_name, updates.caregiver_phone,
      updates.patient_first_name, updates.patient_last_name,
      updates.q1, updates.q2, updates.q3, updates.q4, updates.q5,
      updates.q6, updates.q7, updates.q8, updates.q9, updates.q10,
      updates.notes,
      updates.q1_de, updates.q2_de, updates.q3_de, updates.q4_de, updates.q5_de,
      updates.q6_de, updates.q7_de, updates.q8_de, updates.q9_de, updates.q10_de,
      updates.notes_de,
      updates.user_name,
      JSON.stringify(updatedHistory),
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono odpowiedzi' });
    }

    const [[updated]] = await pool.query('SELECT * FROM tab_responses WHERE id = ?', [id]);
    res.json(updated);

  } catch (err) {
    console.error('Błąd przy aktualizacji feedback:', err);
    res.status(500).json({ error: 'Błąd serwera podczas zapisu feedback.' });
  }
});

app.delete('/api/tabResponses/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    // Sprawdź, czy wpis istnieje i należy do użytkownika (jeśli nie admin)
    const [rows] = await pool.query(
      'SELECT * FROM tab_responses WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono wpisu.' });
    }

    const entry = rows[0];

    if (!isAdmin && entry.user_id !== userId) {
      return res.status(403).json({ error: 'Brak dostępu do usunięcia tego wpisu.' });
    }

    await pool.query('DELETE FROM tab_responses WHERE id = ?', [id]);

    res.json({ message: 'Wpis został usunięty.' });
  } catch (err) {
    console.error('Błąd usuwania wpisu:', err);
    res.status(500).json({ error: 'Błąd serwera podczas usuwania wpisu.' });
  }
});
async function sendSmsViaSmsApi(to, message) {
  const token = process.env.SMSAPI_TOKEN;
  const sender = process.env.SMSAPI_SENDER || '';
  let status = 'error';
  let smsapi_id = '';
  let full_response = '';

  try {
    const res = await axios.post(
      'https://api.smsapi.pl/sms.do',
      new URLSearchParams({
        to,
        message,
        from: sender,
        format: 'json'
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const response = res.data;
    full_response = JSON.stringify(response);

    if (response && Array.isArray(response.list) && response.list.length > 0) {
      const sms = response.list[0];
      status = sms.status;
      smsapi_id = sms.id;

      if (['OK', 'QUEUE'].includes(status)) {
        console.log(`✅ Wysłano SMS do ${sms.number} | Status: ${status}`);
      } else {
        console.warn(`❌ Nieudana wysyłka SMS do ${sms.number} | Status: ${status}`);
      }
    } else {
      status = 'unknown';
      console.warn('❌ Brak poprawnej odpowiedzi z SMSAPI:', response);
    }
  } catch (err) {
    full_response = JSON.stringify(err.response?.data || err.message);
    console.error('❌ Błąd sieci SMSAPI:', full_response);
  }

  // logowanie do bazy
  try {
    await pool.query(
      `INSERT INTO sms_logs (recipient_phone, message, status, smsapi_id, full_response)
       VALUES (?, ?, ?, ?, ?)`,
      [to, message, status, smsapi_id, full_response]
    );
  } catch (dbErr) {
    console.error('❌ Błąd zapisu sms_logs:', dbErr);
  }

  return { success: ['OK', 'QUEUE'].includes(status), status, smsapi_id, number: to, message };
}

app.post('/api/send-sms-feedback-link', authenticate, async (req, res) => {
  const { id } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM tab_responses WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono wpisu.' });
    }

    const feedback = rows[0];
    const link = `${process.env.FRONTEND_URL}/formularz-feedback/${feedback.public_token}`;
    console.log('🔗 Token do formularza:', feedback.public_token);
    const phone = feedback.caregiver_phone.startsWith('+') ? feedback.caregiver_phone : `+48${feedback.caregiver_phone}`;
    const message = `Dzień dobry, dziękujemy za zaufanie. Prosimy o wypenienie formularza: ${link}
    Pozdrawiamy zespół Berlin Opieka 24`;
    console.log('🔗 Link:', link);
    const result = await sendSmsViaSmsApi(phone, message);

    if (result.success) {
      res.json({
        message: 'SMS został wysłany.',
        ...result
      });
    } else {
      res.status(500).json({
        error: 'Nie udało się wysłać SMS-a.',
        ...result
      });
    }
  } catch (err) {
    console.error('❌ Błąd przy wysyłce SMS:', err);
    res.status(500).json({ error: 'Błąd przy wysyłce SMS.' });
  }
});

app.get('/api/sms-logs', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Brak dostępu' });
  }

  const {
    page = 1,
    pageSize = 20,
    search = '',
    sortBy = 'sent_at',
    order = 'DESC'
  } = req.query;

  const allowedSortFields = ['sent_at', 'recipient_phone', 'status'];
  const sortColumn = allowedSortFields.includes(sortBy) ? sortBy : 'sent_at';
  const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const like = `%${search}%`;

  try {
    const [rows] = await pool.query(
      `
      SELECT id, recipient_phone, message, status, smsapi_id, sent_at
      FROM sms_logs
      WHERE recipient_phone LIKE ? OR status LIKE ?
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
      `,
      [like, like, parseInt(pageSize), offset]
    );

    const [[{ count }]] = await pool.query(
      `
      SELECT COUNT(*) as count
      FROM sms_logs
      WHERE recipient_phone LIKE ? OR status LIKE ?
      `,
      [like, like]
    );

    res.json({ data: rows, total: count });
  } catch (err) {
    console.error('❌ Błąd przy pobieraniu sms_logs:', err);
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu logów SMS' });
  }
});

app.get('/api/public-feedback/:token', async (req, res) => {
  const token = req.params.token;

  try {
    const [[feedback]] = await pool.query(
      'SELECT * FROM tab_responses WHERE public_token = ?',
      [token]
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Nie znaleziono formularza' });
    }

    res.json(feedback);
  } catch (err) {
    console.error('❌ Błąd przy pobieraniu formularza publicznego:', err);
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu formularza.' });
  }
});
app.patch('/api/public-feedback/:token', async (req, res) => {
  const token = req.params.token;
  const updates = req.body;

  try {
    const [[entry]] = await pool.query('SELECT * FROM tab_responses WHERE public_token = ?', [token]);
    if (!entry) return res.status(404).json({ error: 'Nie znaleziono formularza' });

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${dd}.${mm}.${yyyy}, ${hh}:${min}:${ss}`;
    const historyEntry = `Edytowano przez Opiekunkę dnia ${formattedDateTime}`;

    let updatedHistory = [];
    if (entry.edit_history) {
      try {
        updatedHistory = JSON.parse(entry.edit_history);
        if (!Array.isArray(updatedHistory)) updatedHistory = [];
      } catch {
        updatedHistory = [];
      }
    }

    updatedHistory.push(historyEntry);

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    fields.push('edit_history');
    values.push(JSON.stringify(updatedHistory));

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await pool.query(
      `UPDATE tab_responses SET ${setClause} WHERE public_token = ?`,
      [...values, token]
    );

    res.json({ message: 'Zapisano dane' });
  } catch (err) {
    console.error('❌ Błąd zapisu przez public feedback:', err);
    res.status(500).json({ error: 'Błąd serwera przy zapisie publicznego formularza' });
  }
});

app.post('/api/send-feedback-notification', async (req, res) => {
  try {
    const mailOptions = {
      to: 'it.berlinopiekunki@gmail.com',
      from: process.env.EMAIL_USER, // desk.berlinopiekunki@gmail.com
      subject: 'Nowy feedback od opiekunki',
      text: 'Dodano feedback. Zaloguj się do desk.berlin-opiekunki.pl by sprawdzić jego treść.'
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email został wysłany.' });
  } catch (err) {
    console.error('❌ Błąd wysyłki powiadomienia:', err);
    res.status(500).json({ error: 'Nie udało się wysłać powiadomienia e-mail.' });
  }
});

// ---------------------- START SERVER ----------------------
app.listen(port, () => {
  console.log(`Server działa na http://localhost:${port}`);
});