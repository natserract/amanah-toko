import { query, body } from 'express-validator';
import Sequelize from 'sequelize';

import { destroy } from './libs/destroy.js';
import { read } from './libs/read.js';
import itemExists from './libs/itemExists.js';
import { description } from './libs/description.js';
import toTitleCase from '../../../libs/toTitleCase.js';
import filters from './libs/filters.js';
import { queryWithFilter } from './libs/queryWithFilter.js';
import { db } from '../../../models';

const Op = Sequelize.Op;
const { Category, Product } = db;

// categoryId, name, description, unitCost, unitPrice, store
const commonRules = [

];

export const dashboardRules = {
  filter: [
    query('name').optional({ checkFalsy: true }).trim().escape(),
    queryWithFilter(
      'category',
      async (value) => {
        try {
          return await Category.findAll({
            where: {
              id: {
                [Op.in]: [value]
              }
            },
          })
        } catch (error) {
          return Promise.reject('Reports not found');
        }
      }
    ),

    ...filters,
  ],

  read: [read('Purchase')],
};
