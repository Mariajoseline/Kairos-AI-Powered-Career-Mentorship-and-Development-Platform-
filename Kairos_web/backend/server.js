import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurations
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Database Connection
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'MySQL' });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  // Registration logic
});

app.post('/api/auth/login', async (req, res) => {
  // Login logic
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
  📡 Listening on port ${PORT}
  ⏰ Started at ${new Date().toLocaleTimeString()}
  `);
});