require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const pool = require('./db'); // import puli połączeń mysql2

const app = express();
const port = 3009;

// CORS + JSON
app.use(cors({
  origin: ['http://localhost:3008', 'https://desk.berlin-opiekunki.pl'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
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
    console.log('JWT_SECRET (generowanie):', process.env.JWT_SECRET);
    
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


// ---------------------- START SERVER ----------------------
app.listen(port, () => {
  console.log(`Server działa na http://localhost:${port}`);
});