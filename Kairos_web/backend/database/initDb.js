import sequelize from './sequelize.js';
import { User, UserProfile } from './model.js';
import bcrypt from 'bcryptjs';

const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ force: true }); // Use { alter: true } in production
    console.log('Database tables created successfully.');

    // Create a test user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });

    await UserProfile.create({
      userId: testUser.id,
      education: 'Bachelor in Computer Science',
      skills: 'JavaScript, React, Node.js',
      goals: 'Become a full-stack developer'
    });

    console.log('Test data created successfully.');
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase(); 