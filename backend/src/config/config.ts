/* eslint-disable no-var */
import { Dialect, Sequelize } from 'sequelize';
import 'dotenv/config';

var sequelize: Sequelize;
const env = process.env.NODE_ENV as 'development' | 'test' | 'production';

export var DB_NAME = process.env.DB_NAME as string;
export const DB_USERNAME = process.env.DB_USER as string;
export const DB_HOST = process.env.DB_HOST as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_DIALECT = process.env.DB_DIALECT as Dialect;

if (env === 'production') {
  const useEnvVariable = process.env.DATABASE_URL as string;
  const productionConfig = {
    dialect: 'postgres' as Dialect,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    logging: false,
  };
  sequelize = new Sequelize(useEnvVariable, productionConfig);
} else {
  if (env === 'development') {
    DB_NAME = process.env.DB_NAME as string;
  }
  if (env === 'test') {
    DB_NAME = process.env.TEST_DB_NAME as string;
  }

  sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT,
  });
}

export default sequelize;
