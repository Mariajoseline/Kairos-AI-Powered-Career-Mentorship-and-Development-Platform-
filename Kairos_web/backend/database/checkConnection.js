import { sequelize } from './sequelize.js';

export const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
};