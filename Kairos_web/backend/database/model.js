import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

const UserProfile = sequelize.define('UserProfile', {
  education: {
    type: DataTypes.TEXT
  },
  skills: {
    type: DataTypes.TEXT
  },
  goals: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

// Relationships
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

// Sync models (only in development)
if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      await sequelize.sync({ alter: true });
      console.log('Database tables synced');
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  })();
}

export { User, UserProfile };