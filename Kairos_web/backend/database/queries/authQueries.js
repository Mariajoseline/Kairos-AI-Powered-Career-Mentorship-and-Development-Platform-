import pool from '../db.js';
import sequelize from '../sequelize.js';
import { User, UserProfile } from '../model.js';

// MySQL Implementation
export const registerUserMySQL = async (userData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );
    
    if (existingUsers.length > 0) {
      throw new Error('Email already exists');
    }
    
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [userData.name, userData.email, userData.password]
    );
    
    await connection.execute(
      'INSERT INTO user_profiles (user_id, education, skills, goals) VALUES (?, ?, ?, ?)',
      [userResult.insertId, userData.education, userData.skills, userData.goals]
    );
    
    await connection.commit();
    return userResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const loginUserMySQL = async (email) => {
  try {
    const [users] = await pool.execute(
      `SELECT users.id, users.name, users.email, users.password, 
       user_profiles.education, user_profiles.skills, user_profiles.goals
       FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id
       WHERE email = ?`,
      [email]
    );
    return users[0];
  } catch (error) {
    console.error('MySQL login error:', error);
    throw new Error('Database error during login');
  }
};

// Sequelize Implementation
export const registerUserSequelize = async (userData) => {
  const transaction = await sequelize.transaction();
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ 
      where: { email: userData.email },
      transaction 
    });
    
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password
    }, { transaction });

    await UserProfile.create({
      userId: user.id,
      education: userData.education,
      skills: userData.skills,
      goals: userData.goals
    }, { transaction });

    await transaction.commit();
    return user.id;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const loginUserSequelize = async (email) => {
  try {
    return await User.findOne({
      where: { email },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });
  } catch (error) {
    console.error('Sequelize login error:', error);
    throw new Error('Database error during login');
  }
};

// Default exports (switch between MySQL/Sequelize via environment variable)
export const registerUser = process.env.DB_TYPE === 'sequelize' 
  ? registerUserSequelize 
  : registerUserMySQL;

export const loginUser = process.env.DB_TYPE === 'sequelize'
  ? loginUserSequelize
  : loginUserMySQL;

export const checkEmailExists = async (email) => {
  try {
    if (process.env.DB_TYPE === 'sequelize') {
      const user = await User.findOne({ where: { email } });
      return !!user;
    } else {
      const [users] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      return users.length > 0;
    }
  } catch (error) {
    console.error('Email check error:', error);
    throw new Error('Database error during email check');
  }
};