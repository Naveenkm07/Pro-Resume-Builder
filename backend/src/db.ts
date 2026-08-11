import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
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
