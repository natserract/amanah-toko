import { default as express } from 'express';
import * as dashboardController from '../controllers/dashboard.js';
import { dashboardRules } from '../../middlewares/validators/rules/dashboard';
import { validate } from '../../middlewares/validators/validate.js';
import filter from '../../middlewares/filters/index.js';

export const router = express.Router();

router
  .route('/')
  .get(
    dashboardRules.filter,
    validate,
    dashboardController.reports
  )
