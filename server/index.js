require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const pool = require('./db'); // import puli połączeń mysql2 z pliku db.js

const app = express();
const port = 3009;

app.use(cors({
  origin: ['http://localhost:3008', 'https://bk-offer.pl'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.json());

// ---------------------- INNE ENDPOINTY -------------------------

// Przykładowy router dla lockstepOffers
const lockstepOffersRouter = require("./routes/lockstepOffers");
app.use("/api/lockstep-offers", lockstepOffersRouter);

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [name, email, hashedPassword, role || 'user']);
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
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
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

// ----------------------- ENDPOINTY RESETU HASŁA -----------------------

// Konfiguracja Nodemailer (przykład dla Gmaila)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // np. twojemail@gmail.com
    pass: process.env.EMAIL_PASS  // hasło lub hasło aplikacji
  }
});

// Endpoint wysyłki linka resetującego
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Sprawdzamy, czy użytkownik o podanym e-mailu istnieje
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    }
    
    // Generujemy token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Zapisujemy token wraz z datą utworzenia w tabeli "password_resets"
    await pool.execute(
      'INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())',
      [email, token]
    );
    
    // Budujemy link resetujący – FRONTEND_URL ustawiony w .env
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    // Konfiguracja wiadomości e-mail
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Resetowanie hasła',
      text: `Kliknij na poniższy link, aby zresetować hasło:\n\n${resetLink}\n\nLink jest ważny przez 1 godzinę.`
    };
    
    // Wysyłamy e-mail
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Link resetujący został wysłany na Twój adres e-mail' });
    
  } catch (error) {
    console.error('Błąd podczas resetu hasła:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Endpoint aktualizacji hasła po kliknięciu w link
app.post('/api/update-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // Pobieramy rekord odpowiadający tokenowi
    const [records] = await pool.execute('SELECT email, created_at FROM password_resets WHERE token = ?', [token]);
    
    if (records.length === 0) {
      return res.status(400).json({ message: 'Token jest nieprawidłowy lub wygasł.' });
    }
    
    const record = records[0];
    const tokenAge = (Date.now() - new Date(record.created_at).getTime()) / 1000;
    if (tokenAge > 3600) { // 3600 sekund = 1 godzina
      return res.status(400).json({ message: 'Token wygasł, spróbuj ponownie' });
    }
    
    // Haszujemy nowe hasło
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Aktualizujemy hasło w tabeli "users"
    await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, record.email]);
    
    // Usuwamy rekord z tokenem
    await pool.execute('DELETE FROM password_resets WHERE token = ?', [token]);
    
    res.json({ message: 'Hasło zostało zaktualizowane.' });
    
  } catch (error) {
    console.error('Błąd przy aktualizacji hasła:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// --------------------------------------------------

app.listen(port, () => {
  console.log(`Server działa na http://localhost:${port}`);
});