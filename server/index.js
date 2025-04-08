require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('Połączono z MySQL');
});

// Middleware parsujące JSON, jeśli potrzebny
app.use(express.json());

// Inne middleware i konfiguracje Twojej aplikacji

// Importuj router z ofertami z zewnętrznego API
const lockstepOffersRouter = require("./routes/lockstepOffers");

// Montowanie routera – endpointy będą dostępne pod /api/lockstep-offers
app.use("/api/lockstep-offers", lockstepOffersRouter);

// Rejestracja
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, hashedPassword, role || 'user'], (err, result) => {
    if (err) return res.status(500).json({ error: 'Email już istnieje lub błąd serwera' });
    res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
  });
});

// Logowanie
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Zalogowano', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

app.get('/check-email', (req, res) => {
  const { email } = req.query;

  // 👇 dodaj tę walidację
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Nieprawidłowy adres e-mail' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera przy sprawdzaniu e-maila' });
    res.json({ exists: results.length > 0 });
  });
});

// Sprawdzenie czy email istnieje
app.get('/check-email', (req, res) => {
  const { email } = req.query;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Błąd serwera' });
    res.json({ exists: results.length > 0 });
  });
});

// Dodaj poniżej innych endpointów w Twoim serwerze (np. pod app.get('/entries', ...))
app.get('/userdb', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Błąd przy pobieraniu danych użytkownika:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    // Zakładamy, że chcesz zwrócić wszystkich użytkowników w obiekcie, gdzie tablica jest w polu "users"
    res.json({ users: results });
  });
});

// Reset hasła
app.post('/reset-password', (req, res) => {
  const { email } = req.body;
  const newPassword = Math.random().toString(36).slice(2, 10);
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const sql = 'UPDATE users SET password = ? WHERE email = ?';
  db.query(sql, [hashedPassword, email], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(404).json({ error: 'Użytkownik nie istnieje' });
    res.json({ message: 'Hasło zresetowane', newPassword });
  });
});

app.get('/entries', (req, res) => {
  db.query('SELECT * FROM entries ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Błąd przy pobieraniu danych:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    res.json(results);
  });
});
app.delete('/entries/:id', (req, res) => {
  const entryId = req.params.id;
  db.query('DELETE FROM entries WHERE id = ?', [entryId], (err, result) => {
    if (err) {
      console.error('Błąd przy usuwaniu:', err);
      return res.status(500).json({ error: 'Błąd serwera przy usuwaniu wpisu' });
    }
    res.json({ message: 'Wpis usunięty' });
  });
});
app.post('/change-password', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Brak tokenu' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });

      const user = results[0];
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Stare hasło nieprawidłowe' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err2) => {
        if (err2) return res.status(500).json({ error: 'Błąd aktualizacji hasła' });
        res.json({ message: 'Hasło zostało zmienione' });
      });
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
  }
});

app.put('/entries/:id', (req, res) => {
  const id = req.params.id;
  const {
    imie, nazwisko, jezyk, fs, nr,
    do_opieki, dyspozycyjnosc, oczekiwania,
    referencje, ostatni_kontakt, notatka
  } = req.body;

  const sql = `
    UPDATE entries SET 
      imie = ?, nazwisko = ?, jezyk = ?, fs = ?, nr = ?,
      do_opieki = ?, dyspozycyjnosc = ?, oczekiwania = ?,
      referencje = ?, ostatni_kontakt = ?, notatka = ?
    WHERE id = ?
  `;

  const values = [
    imie, nazwisko, jezyk, fs, nr,
    do_opieki, dyspozycyjnosc, oczekiwania,
    referencje, ostatni_kontakt, notatka, id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Błąd edycji:', err);
      return res.status(500).json({ error: 'Błąd podczas edycji' });
    }
    res.json({ message: 'Dane zaktualizowane' });
  });
});

app.post('/entries', (req, res) => {
  // Twoje zapytanie SQL do dodania danych
  const { imie, nazwisko, jezyk, fs, nr, do_opieki, dyspozycyjnosc, oczekiwania, referencje, ostatni_kontakt, notatka } = req.body;

  const sql = `
    INSERT INTO entries (imie, nazwisko, jezyk, fs, nr, do_opieki, dyspozycyjnosc, oczekiwania, referencje, ostatni_kontakt, notatka)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [imie, nazwisko, jezyk, fs, nr, do_opieki, dyspozycyjnosc, oczekiwania, referencje, ostatni_kontakt, notatka];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Błąd zapytania SQL:', err);
      return res.status(500).json({ error: 'Błąd zapisu danych', message: err.message });
    }
    res.status(201).json({ message: 'Wpis dodany pomyślnie' });
  });
});

app.listen(3001, () => {
  console.log("Server działa na http://localhost:3001");
});
