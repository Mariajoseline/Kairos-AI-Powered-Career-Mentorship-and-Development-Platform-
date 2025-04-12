import express from 'express';
import { getUserProfile, updateUserProfile } from '../database/queries/userQueries.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.get('/profile/:id', authenticate, async (req, res) => {
  try {
    const user = await getUserProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile/:id', authenticate, async (req, res) => {
  try {
    const { education, skills, goals } = req.body;
    
    if (!education && !skills && !goals) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await updateUserProfile(req.params.id, { education, skills, goals });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;