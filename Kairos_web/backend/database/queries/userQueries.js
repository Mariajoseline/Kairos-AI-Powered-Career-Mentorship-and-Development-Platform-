import pool from '../db.js';
import sequelize from '../sequelize.js';

export const getUserProfile = async (userId) => {
  if (process.env.DB_TYPE === 'sequelize') {
    return await sequelize.models.User.findByPk(userId, {
      include: [{
        model: sequelize.models.UserProfile,
        as: 'profile'
      }]
    });
  } else {
    const [users] = await pool.execute(
      `SELECT users.id, users.name, users.email, 
       user_profiles.education, user_profiles.skills, user_profiles.goals
       FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id
       WHERE users.id = ?`,
      [userId]
    );
    return users[0];
  }
};

export const updateUserProfile = async (userId, profileData) => {
  if (process.env.DB_TYPE === 'sequelize') {
    const transaction = await sequelize.transaction();
    try {
      await sequelize.models.UserProfile.update({
        education: profileData.education,
        skills: profileData.skills,
        goals: profileData.goals
      }, {
        where: { userId },
        transaction
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } else {
    await pool.execute(
      'UPDATE user_profiles SET education = ?, skills = ?, goals = ? WHERE user_id = ?',
      [profileData.education, profileData.skills, profileData.goals, userId]
    );
  }
};