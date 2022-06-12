import { initDB } from './server/database.js';

import dotenv from 'dotenv';
import { initModel } from './models/index.js';
import { initPool } from './server/pool.js';

dotenv.config();

const run = async () => {
  await initDB();
  await initModel();
  await initPool();
};

run();
