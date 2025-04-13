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
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    indexes: [{
      unique: true
    }]
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'mentor'),
    defaultValue: 'user'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['role']
    }
  ]
});

const UserProfile = sequelize.define('UserProfile', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  education: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 2000]
    }
  },
  skills: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 1000]
    }
  },
  goals: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 1000]
    }
  },
  experience: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 2000]
    }
  },
  interests: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500]
    }
  },
  profilePicture: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  linkedInUrl: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  githubUrl: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  portfolioUrl: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    }
  ]
});

// Relationships
User.hasOne(UserProfile, { 
  foreignKey: 'userId', 
  as: 'profile',
  onDelete: 'CASCADE'
});
UserProfile.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

// Hooks for data sanitization
User.beforeCreate(async (user) => {
  if (user.email) {
    user.email = user.email.toLowerCase().trim();
  }
  if (user.name) {
    user.name = user.name.trim();
  }
});

UserProfile.beforeCreate(async (profile) => {
  if (profile.education) profile.education = profile.education.trim();
  if (profile.skills) profile.skills = profile.skills.trim();
  if (profile.goals) profile.goals = profile.goals.trim();
  if (profile.experience) profile.experience = profile.experience.trim();
  if (profile.interests) profile.interests = profile.interests.trim();
});

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