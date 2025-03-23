const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase PostgreSQL
});

// Create table if it doesn’t exist
pool.query(`
  CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
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
`).then(() => {
  console.log('Connected to PostgreSQL database and ensured table exists.');
}).catch((err) => {
  console.error('Error connecting to PostgreSQL:', err.message);
});

app.get('/vouchers/:month', async (req, res) => {
  const month = req.params.month;
  const year = req.query.year;
  console.log('Querying for:', { month, year });
  try {
    const result = await pool.query('SELECT * FROM vouchers WHERE month = $1 AND year = $2', [month, year]);
    console.log('Found rows:', result.rows);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/vouchers', async (req, res) => {
  const { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year } = req.body;
  console.log('Saving voucher:', { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year });
  try {
    await pool.query(
      'INSERT INTO vouchers (voucherNumber, date, name, bank, chequeNumber, amount, category, month, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [voucherNumber, date, name, bank, chequeNumber, amount, category, month, year]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/vouchers/:id', async (req, res) => {
  const { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year } = req.body;
  try {
    await pool.query(
      'UPDATE vouchers SET voucherNumber = $1, date = $2, name = $3, bank = $4, chequeNumber = $5, amount = $6, category = $7, month = $8, year = $9 WHERE id = $10',
      [voucherNumber, date, name, bank, chequeNumber, amount, category, month, year, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/vouchers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vouchers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
    console.log(`Deleted voucher with id: ${req.params.id}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});