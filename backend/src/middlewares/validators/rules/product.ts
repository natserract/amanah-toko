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
  body('categoryId')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Category id is required')
    .bail()
    .custom(async (id: string) => {
      const category = await Category.findByPk(id);
      if (category === null) {
        throw new Error('Category not found');
      }
      return true;
    }),

  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Product name must be between 2 and 50 characters')
    .bail()
    .custom(async (name: string, { req }) => {
      const product = await Product.findOne({ where: { name } });
      if (itemExists(product, req.body.id)) {
        return Promise.reject('A product with this name already exists');
      }
      return true;
    })
    .customSanitizer((name: string) => {
      return toTitleCase(name);
    }),

  description,

  body('unitCost')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Unit cost is required')
    .isFloat({ min: 1.0 })
    .withMessage('Unit cost must be greater than 1.00')
    .toFloat(),

  body('unitPrice')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 1.0 })
    .withMessage('Unit price must be greater than 1.00')
    .toFloat()
    .custom((unitPrice, { req }) => {
      if (unitPrice < req.body.unitCost) {
        throw new Error('Unit price must not be less than unit cost');
      }
      return true;
    }),

  body('store')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Number of items in store is required')
    .isInt({ min: 1 })
    .withMessage('Number of items in store must be greater than 0')
    .toInt(),
];

export const productRules = {
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
          return Promise.reject('Product not found');
        }
      }
    ),

    ...filters,
  ],

  create: commonRules,

  read: [read('Product')],

  update: [
    body('id')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Product id is required')
      .custom(async (id: string) => {
        const product = await Product.findByPk(id);
        if (product === null) {
          throw new Error('Product not found');
        }
        return true;
      }),

    ...commonRules,
  ],

  destroy: [destroy('Product', async (pk) => await Product.findByPk(pk))],
};
