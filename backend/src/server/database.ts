/* eslint-disable no-var */
import { SequelizeStorage, Umzug } from 'umzug';

import { db } from '../models';

export const initDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const umzug = new Umzug({
      migrations: { glob: 'migrations/*.js' },
      context: db.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: db.sequelize }),
      logger: console,
    });
    // Checks migrations and run them if they are not already applied. To keep
    // track of the executed migrations, a table (and sequelize model) called
    // SequelizeMeta will be automatically created (if it doesn't exist
    // already) and parsed.
    await umzug.up();
  } catch (err) {
    console.log(`Unable to connect to the database: ${err}`);
  }

  try {
    await db.sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize models:', error);
  }
};
