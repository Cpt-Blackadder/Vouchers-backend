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
const supabaseUrl = process.env.SUPABASE_URL; // e.g., https://bfholfyfdpsxlgzmssnn.supabase.co
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Your anon key from Supabase dashboard
console.log('SUPABASE_URL:', supabaseUrl); // Debug: Log the URL
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Set (hidden for security)' : 'Not set'); // Debug: Log if the key is set
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
  process.exit(1); // Exit if variables are not set
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Test route to verify database connection
app.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('vouchers').select('id').limit(1);
    if (error) throw error;
    console.log('Database connection successful:', data);
    res.json({ success: true, message: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get unique categories
app.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('category')
      .order('category', { ascending: true });
    if (error) throw error;
    const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
    res.status(200).json(uniqueCategories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get unique names
app.get('/names', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('name')
      .order('name', { ascending: true });
    if (error) throw error;
    const uniqueNames = [...new Set(data.map(item => item.name))].filter(Boolean);
    res.status(200).json(uniqueNames);
  } catch (err) {
    console.error('Error fetching names:', err.message);
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
    res.status(200).json(data);
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