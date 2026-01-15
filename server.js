//const express = require('express');
//const cors = require('cors');
//
//const app = express();
//app.use(cors());
//app.use(express.json());
//app.use(express.static('public'));
//
//
//
//app.use('/api/auth', require('./routes/auth.routes'));
//
//app.listen(3000, () => {
//  console.log('Server running http://localhost:3000');
//});

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/edit-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'edit-profile.html'));
});

app.get('/choose-language', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'choose-language.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/assessment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assessment.html'));
});

app.get('/sub-lessons', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sub-lessons.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
