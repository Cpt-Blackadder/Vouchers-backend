const express = require('express');
const { createClient } = require('@supabase/supabase-js');
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

// Configure Supabase client
const supabaseUrl = process.env.https://bfholfyfdpsxlgzmssnn.supabase.co;
const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaG9sZnlmZHBzeGxnem1zc25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTk1NjIsImV4cCI6MjA1ODMzNTU2Mn0.te2m3CImZHE8Dc04weMEx1A2yPSHWIb5QPairbOiXjY; // Your anon key from Supabase dashboard
const supabase = createClient(supabaseUrl, supabaseKey);

// Test route to verify database connection
app.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('vouchers').select('1').limit(1);
    if (error) throw error;
    console.log('Database connection successful:', data);
    res.json({ success: true, message: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create table if it doesn’t exist (optional, can also create in Supabase dashboard)
app.get('/init-db', async (req, res) => {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS vouchers (
          id SERIAL PRIMARY KEY,
          "voucherNumber" TEXT,
          "date" TEXT,
          "name" TEXT,
          "bank" TEXT,
          "chequeNumber" TEXT,
          "amount" REAL,
          "category" TEXT,
          "month" TEXT,
          "year" TEXT
        )
      `
    });
    if (error) throw error;
    res.json({ success: true, message: 'Table created or already exists' });
  } catch (err) {
    console.error('Error creating table:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/vouchers/:month', async (req, res) => {
  const month = req.params.month;
  const year = req.query.year;
  console.log('Querying for:', { month, year });
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('month', month)
      .eq('year', year);
    if (error) throw error;
    console.log('Found rows:', data);
    res.json(data);
  } catch (err) {
    console.error('Query error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/vouchers', async (req, res) => {
  const { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year } = req.body;
  console.log('Saving voucher:', { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year });
  try {
    const { error } = await supabase
      .from('vouchers')
      .insert([{ voucherNumber, date, name, bank, chequeNumber, amount, category, month, year }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Insert error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/vouchers/:id', async (req, res) => {
  const { voucherNumber, date, name, bank, chequeNumber, amount, category, month, year } = req.body;
  try {
    const { error } = await supabase
      .from('vouchers')
      .update({ voucherNumber, date, name, bank, chequeNumber, amount, category, month, year })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/vouchers/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
    console.log(`Deleted voucher with id: ${req.params.id}`);
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Root route for informational purposes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the KVVK Vouchers Backend API' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});