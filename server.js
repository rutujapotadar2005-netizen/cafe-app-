const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;
const DB   = path.join(__dirname, 'database.json');

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── JSON Database Helpers ───────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB)) {
    const empty = { users: [], orders: [], contacts: [] };
    fs.writeFileSync(DB, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(DB, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

console.log('✅ JSON database ready (database.json)');

// ── REGISTER ────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: 'Please fill all required fields.' });
  if (password.length < 6)
    return res.json({ success: false, message: 'Password must be at least 6 characters.' });

  const db = readDB();
  if (db.users.find(u => u.email === email))
    return res.json({ success: false, message: 'Email already registered.' });

  const user = { id: Date.now(), name, email, phone: phone || '', password, joined: new Date().toISOString() };
  db.users.push(user);
  writeDB(db);

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: 'Account created!' });
});

// ── LOGIN ───────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: 'Please fill all fields.' });

  const db   = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user)
    return res.json({ success: false, message: 'Invalid email or password.' });

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: 'Login successful!' });
});

// ── PLACE ORDER ─────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { user_email, items, total, delivery_address, order_type } = req.body;
  if (!user_email || !items || !total)
    return res.json({ success: false, message: 'Invalid order data.' });

  const db = readDB();
  db.orders.push({
    id: Date.now(),
    user_email,
    items,
    total,
    delivery_address: delivery_address || 'Not provided',
    order_type: order_type || 'delivery',
    status: 'Pending',
    ordered_at: new Date().toISOString()
  });
  writeDB(db);
  res.json({ success: true, message: 'Order placed successfully!' });
});

// ── GET ORDERS (per user) ───────────────────────────────────
app.get('/api/orders/:email', (req, res) => {
  const db     = readDB();
  const orders = db.orders.filter(o => o.user_email === req.params.email).reverse();
  res.json({ success: true, orders });
});

// ── ADMIN: ALL ORDERS ───────────────────────────────────────
app.get('/api/admin/orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, orders: db.orders });
});

// ── ADMIN: UPDATE ORDER STATUS ──────────────────────────────
app.patch('/api/admin/orders/:id', (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const order = db.orders.find(o => String(o.id) === req.params.id);
  if (!order) return res.json({ success: false, message: 'Order not found.' });
  order.status = status;
  writeDB(db);
  res.json({ success: true, order });
});

// ── ADMIN: ALL USERS ────────────────────────────────────────
app.get('/api/admin/users', (req, res) => {
  const db = readDB();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json({ success: true, users: safeUsers });
});

// ── ADMIN: ALL CONTACTS ─────────────────────────────────────
app.get('/api/admin/contacts', (req, res) => {
  const db = readDB();
  res.json({ success: true, contacts: db.contacts });
});

// ── CONTACT ─────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email)
    return res.json({ success: false, message: 'Name and email are required.' });

  const db = readDB();
  db.contacts.push({ id: Date.now(), name, email, subject, message, sent_at: new Date().toISOString() });
  writeDB(db);
  res.json({ success: true, message: 'Message sent successfully!' });
});

// ── Catch-all → index.html ───────────────────────────────────
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`☕ Red Eye Café running → http://localhost:${PORT}`);
  console.log(`📁 Database file: database.json`);
});
