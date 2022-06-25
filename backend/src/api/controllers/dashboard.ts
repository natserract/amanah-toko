import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { db } from '../../models';

const { Product, Purchase, Supplier, Sale, sequelize } = db;

async function reports(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      startsAt,
      endsAt,
      by,
    } = req.query as {
      startsAt: Date | string;
      endsAt: Date | string;
      by: "purchaseBySupplier" | "salesByProduct"
    }
    const isHasBetweenDate = Boolean(startsAt && endsAt)
    const isHasBy = Boolean(by)

    // :: Reports Sales by month
    const reportsSales = await Sale.findAll({
      attributes: [
        [sequelize.fn('count', sequelize.col('productId')), 'productCount'],
        [sequelize.fn('sum', sequelize.col('totalPrice')), 'total'],
        [sequelize.fn('to_char', sequelize.col(`"Sale"."createdAt"`), 'MM'), 'month']
      ],

      group: [
        sequelize.fn('to_char', sequelize.col(`"Sale"."createdAt"`), 'MM'),
      ],

      // :: Reports Sales by month/date range
      ...(isHasBetweenDate && {
        where: {
          createdAt: {
            [Op.between]: [startsAt, endsAt]
           }
        }
      })
    })

    const reportsSalesByProduct = await Sale.findAll({
      attributes: [
        [sequelize.fn('count', sequelize.col('productId')), 'productCount'],
        [sequelize.fn('sum', sequelize.col('totalPrice')), 'total'],
      ],

      group: [
        "product.id"
      ],
      include: {
        model: Product,
        as: 'product',
        attributes: ['name']
      },

      // :: Reports Sales by month/date range
      ...(isHasBetweenDate && {
        where: {
          createdAt: {
            [Op.between]: [startsAt, endsAt]
           }
        }
      })
    })

    // :: Reports Purchases by month
    const reportsPurchases = await Purchase.findAll({
      attributes: [
        [sequelize.fn('count', sequelize.col('productId')), 'productCount'],
        [sequelize.fn('count', sequelize.col('supplierId')), 'supplierCount'],
        [sequelize.fn('sum', sequelize.col('totalPrice')), 'total'],
        [sequelize.fn('to_char', sequelize.col(`"Purchase"."createdAt"`), 'MM'), 'month']
      ],

      // Filter purchase by conditions (by supplier)
      ...(isHasBy && by == 'purchaseBySupplier' ? {
        group: [
          sequelize.fn('to_char', sequelize.col(`"Purchase"."createdAt"`), 'MM'),
          "supplier.id"
        ],
        include: {
          model: Supplier,
          as: 'supplier',
          attributes: ['name']
        },
      } : {
        group: [
          sequelize.fn('to_char', sequelize.col(`"Purchase"."createdAt"`), 'MM'),
        ]
      }),

      // :: Reports Purchases by month/date range
      ...(isHasBetweenDate && {
        where: {
          createdAt: {
           [Op.between]: [startsAt, endsAt]
          }
         }
      })
    })

    return res.status(200).json({
      sales: reportsSales,
      salesByProduct: reportsSalesByProduct,
      purchases: reportsPurchases,
    });

  } catch (error) {
    console.log('\n\nError getting reports: ', error, '\n\n');
    next({ status: 500, error: 'Db error getting reports' });
  }
}

export { reports };
