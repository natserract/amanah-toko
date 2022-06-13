import { query, body } from 'express-validator';
import Sequelize from 'sequelize';
import { destroy } from './libs/destroy.js';
import { read } from './libs/read.js';
import filters from './libs/filters.js';
import { queryWithFilter } from './libs/queryWithFilter.js';
import { db } from '../../../models';
import { description } from './libs/description.js';

const Op = Sequelize.Op;
const { Product, Sale } = db;

const quantity = body('quantity')
  .trim()
  .escape()
  .notEmpty()
  .withMessage('Quantity of items sold is required')
  .isInt({ min: 1 })
  .withMessage('Quantity of items sold must be greater than 0')
  .toInt();

export const saleRules = {
  filter: [
    queryWithFilter(
      'product',
      async (productName) =>
        await Product.findAll({
          where: {
            name: { [Op.like]: `%${productName}%` },
          },
        })
    ),

    ...filters,
  ],

  create: [
    body('productId')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Product id is required')
      .bail()
      .custom(async (id: string) => {
        const product = await Product.findByPk(id);
        if (product === null) {
          throw new Error('Product not found');
        }
        return true;
      }),

    // body('invoiceNo')
    //   .trim()
    //   .escape()
    //   .notEmpty()
    //   .withMessage('Invoice no is required')
    //   .bail(),

    // body('totalPrice')
    //   .trim()
    //   .escape()
    //   .notEmpty()
    //   .withMessage('Total price is required')
    //   .isFloat({ min: 1.0 })
    //   .withMessage('Total price must be greater than 1.00')
    //   .toFloat(),

    quantity,
    description,
  ],

  read: [read('Sale')],

  update: [
    body('id')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Sale id is required')
      .bail()
      .custom(async (id: string) => {
        const sale = await Sale.findByPk(id);
        if (sale === null) {
          throw new Error('Sale not found');
        }
        return true;
      }),

    quantity,
  ],

  destroy: [destroy('Sale', async (pk) => await Sale.findByPk(pk))],
};
