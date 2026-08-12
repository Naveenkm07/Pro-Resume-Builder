import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.POSTGRES_URL || '', {
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
