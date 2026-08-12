import { Sequelize } from 'sequelize';

const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';

export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectModule: require('pg'),
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ SQLite connected and synced');
    return sequelize;
  } catch (error) {
    console.error('❌ SQLite connection error:', error);
    throw error;
  }
};
