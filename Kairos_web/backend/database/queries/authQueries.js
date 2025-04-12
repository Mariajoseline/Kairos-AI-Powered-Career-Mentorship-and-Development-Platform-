import pool from '../db.js';
import sequelize from '../sequelize.js';

// MySQL Implementation
export const registerUserMySQL = async (userData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
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
  const [users] = await pool.execute(
    `SELECT users.id, users.name, users.email, users.password, 
     user_profiles.education, user_profiles.skills, user_profiles.goals
     FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id
     WHERE email = ?`,
    [email]
  );
  return users[0];
};

// Sequelize Implementation
export const registerUserSequelize = async (userData) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await sequelize.models.User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password
    }, { transaction });

    await sequelize.models.UserProfile.create({
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
  return await sequelize.models.User.findOne({
    where: { email },
    include: [{
      model: sequelize.models.UserProfile,
      as: 'profile'
    }]
  });
};

// Default exports (switch between MySQL/Sequelize via environment variable)
export const registerUser = process.env.DB_TYPE === 'sequelize' 
  ? registerUserSequelize 
  : registerUserMySQL;

export const loginUser = process.env.DB_TYPE === 'sequelize'
  ? loginUserSequelize
  : loginUserMySQL;

export const checkEmailExists = async (email) => {
  if (process.env.DB_TYPE === 'sequelize') {
    const user = await sequelize.models.User.findOne({ where: { email } });
    return !!user;
  } else {
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    return users.length > 0;
  }
};