import sequelize from './sequelize.js';
import pool from './db.js';

const checkConnections = async () => {
  console.log('Checking database connections...');
  
  // Check Sequelize connection
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connection established successfully');
  } catch (error) {
    console.error('❌ Sequelize connection error:', error.message);
  }
  
  // Check MySQL connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection established successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
  }
  
  // Check database tables
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('📋 Database tables:');
    if (tables.length === 0) {
      console.log('   No tables found. Run "npm run init-db" to create tables.');
    } else {
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
  
  process.exit(0);
};

checkConnections(); 