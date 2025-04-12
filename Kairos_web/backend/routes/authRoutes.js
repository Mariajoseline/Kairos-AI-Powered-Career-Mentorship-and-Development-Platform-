import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkEmailExists, registerUser, loginUser } from '../database/queries/authQueries.js';

const router = express.Router();

// Email availability check
router.post('/check-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const exists = await checkEmailExists(email);
    res.json({ available: !exists });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// User registration
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, education, skills, goals } = req.body;
    
    // Validation
    if (!name || !email || !password || !education || !skills || !goals) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (await checkEmailExists(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await registerUser({
      name,
      email,
      password: hashedPassword,
      education,
      skills,
      goals
    });

    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      id: userId, 
      name, 
      email, 
      token,
      education,
      skills,
      goals
    });
  } catch (error) {
    next(error);
  }
});

// User login
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await loginUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      education: user.profile?.education || user.education,
      skills: user.profile?.skills || user.skills,
      goals: user.profile?.goals || user.goals,
      token
    });
  } catch (error) {
    next(error);
  }
});

export default router;