require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise'); // Using promise-based MySQL
const app = express();

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Database Health Check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.status(200).json({
      status: 'success',
      db: 'connected',
      solution: rows[0].solution,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

// Protected Route Example with DB
app.get('/api/user/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Error Handlers (same as previous version)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(`Database: ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});