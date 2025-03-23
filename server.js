const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000; // Use PORT environment variable for Vercel

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const db = new sqlite3.Database('./vouchers.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to SQLite database.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucherNumber TEXT,
    date TEXT,
    name TEXT,
    bank TEXT,
    chequeNumber TEXT,
    amount REAL,
    category TEXT,
    month TEXT,
    year TEXT
  )
`);

app.get('/vouchers/:month', (req, res) => {
  const month = req.params.month;
  const year = req.query.year;
  console.log('Querying for:', { month, year });
  db.all('SELECT * FROM vouchers WHERE month = ? AND year = ?', [month, year], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log('Found rows:', rows);
    res.json(rows);
  });
});

app.post('/vouchers', (req, res) => {
  const { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year } = req.body;
  console.log('Saving voucher:', { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year });
  db.run(
    'INSERT INTO vouchers (voucherNumber, date, name, bank, chequeNumber, amount, category, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [voucherNumber, date, name, bank, chequeNumber, amount, category, month, year],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.put('/vouchers/:id', (req, res) => {
  const { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year } = req.body;
  db.run(
    'UPDATE vouchers SET voucherNumber = ?, date = ?, name = ?, bank = ?, chequeNumber = ?, amount = ?, category = ?, month = ?, year = ? WHERE id = ?',
    [voucherNumber, date, name, bank, chequeNumber, amount, category, month, year, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/vouchers/:id', (req, res) => {
  db.run('DELETE FROM vouchers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
    console.log(`Deleted voucher with id: ${req.params.id}`);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});