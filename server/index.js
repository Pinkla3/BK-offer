require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('./db');

const app = express();
const port = 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'https://bk-offer.pl'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.json());

const lockstepOffersRouter = require("./routes/lockstepOffers");
app.use("/api/lockstep-offers", lockstepOffersRouter);

app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await pool.query(sql, [email]);
    if (results.length === 0) return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Zalogowano', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Błąd logowania' });
  }
});

app.get('/check-email', async (req, res) => {
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

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const newPassword = Math.random().toString(36).slice(2, 10);
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  try {
    const [result] = await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Użytkownik nie istnieje' });
    res.json({ message: 'Hasło zresetowane', newPassword });
  } catch (err) {
    res.status(500).json({ error: 'Błąd resetowania hasła' });
  }
});

app.get('/entries', async (req, res) => {
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

app.delete('/entries/:id', async (req, res) => {
  const entryId = req.params.id;
  try {
    await pool.query('DELETE FROM entries WHERE id = ?', [entryId]);
    res.json({ message: 'Wpis usunięty' });
  } catch (err) {
    console.error('Błąd przy usuwaniu:', err);
    res.status(500).json({ error: 'Błąd serwera przy usuwaniu wpisu' });
  }
});

app.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Brak tokenu' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let results;

    if (decoded.role === 'admin') {
      // Admin widzi wszystkie wpisy + nazwę użytkownika
      [results] = await pool.query(`
        SELECT entries.*, users.name AS user_name 
        FROM entries 
        JOIN users ON entries.user_id = users.id 
        ORDER BY entries.id DESC
      `);
    } else {
      // Zwykły użytkownik widzi tylko swoje wpisy
      [results] = await pool.query(
        'SELECT * FROM entries WHERE user_id = ? ORDER BY id DESC',
        [userId]
      );
    }
    if (results.length === 0) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });

    const user = results[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Stare hasło nieprawidłowe' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    res.json({ message: 'Hasło zostało zmienione' });
  } catch (error) {
    res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
  }
});

app.put('/entries/:id', async (req, res) => {
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

  try {
    await pool.query(sql, values);
    res.json({ message: 'Dane zaktualizowane' });
  } catch (err) {
    console.error('Błąd edycji:', err);
    res.status(500).json({ error: 'Błąd podczas edycji' });
  }
});

app.post('/entries', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokenu' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const {
      imie, nazwisko, jezyk, fs, nr, do_opieki,
      dyspozycyjnosc, oczekiwania, referencje,
      ostatni_kontakt, notatka
    } = req.body;

    const sql = `
      INSERT INTO entries (
        imie, nazwisko, jezyk, fs, nr, do_opieki,
        dyspozycyjnosc, oczekiwania, referencje,
        ostatni_kontakt, notatka, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      imie, nazwisko, jezyk, fs, nr, do_opieki,
      dyspozycyjnosc, oczekiwania, referencje,
      ostatni_kontakt, notatka, userId
    ];

    await pool.query(sql, values);
    res.status(201).json({ message: 'Wpis dodany pomyślnie' });
  } catch (err) {
    console.error('Błąd zapisu wpisu:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.listen(port, () => {
  console.log(`Server działa na http://localhost:${port}`);
});

