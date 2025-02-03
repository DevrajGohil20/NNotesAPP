require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Static files and catch-all route (AFTER API routes)
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.redirect(process.env.FRONTEND_URL);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));