import { Request, Response, NextFunction } from 'express';
import { enumFromStringValue } from '../../libs/common';
import { db } from '../../models';
import { Location } from '../../models/purchase'

const { sequelize } = db;
const { Purchase, Product, Supplier } = db;

async function purchases(req: Request, res: Response, next: NextFunction) {
  try {
    const { filter, pagination } = res.locals;
    const { count, rows } = await Purchase.findAndCountAll({
      distinct: true,
      include: [
        {
          model: Product,
          as: 'product',
        },
        {
          model: Supplier,
          as: 'supplier',
        },
      ],
      ...filter,
    });

    if (count) {
      pagination.count = count;
      return res.status(200).json({ purchases: rows, pagination });
    } else {
      return res.status(400).json({
        error: 'No purchases found',
      });
    }
  } catch (error) {
    console.log('\n\nError getting purchases: ', error, '\n\n');
    next({ status: 500, error: 'Db error getting purchases' });
  }
}

async function create(req: Request, res: Response) {
  try {
    const {
      supplierId,
      productId,
      quantity,
      unitCost,
      unitPrice,
      description,
      isNewProduct = false
    } = req.body;

    const location = enumFromStringValue(Location, req.body.location) ?? Location.STORE

    const supplier = Supplier.findByPk(supplierId);
    if (supplier === null) {
      return res.status(400).json({
        error: 'Supplier not found',
      });
    }

    const product = await Product.findByPk(productId);
    if (product === null) {
      return res.status(400).json({
        error: 'Product not found',
      });
    }

    return await sequelize.transaction(async (t) => {
      const totalPrice = unitCost * quantity;

      const { count } = await Purchase.findAndCountAll({
        distinct: true,
        include: [
          {
            model: Product,
            as: 'product',
          },
          {
            model: Supplier,
            as: 'supplier',
          },
        ],
      });
      const invoiceNo = String(count + 1);

      const purchase = await Purchase.create(
        {
          supplierId,
          productId,
          quantity,
          unitCost,
          unitPrice,
          location,
          description,
          totalPrice,
          invoice_no: invoiceNo
        },
        { transaction: t }
      );

      let { store } = product.dataValues!;
      if (location === 'store') {
        if (isNewProduct) {
          store = quantity
        } else {
          store += quantity;
        }
      }

      if (store < 0) {
        throw new Error(
          'Purchase creation will result in a negative value for items in store'
        );
      }

      const [affectedProductRows] = await Product.update(
        { unitCost, unitPrice, store },
        {
          where: { id: productId },
          transaction: t,
        }
      );

      if (purchase.dataValues && affectedProductRows === 1) {
        return res.status(201).json({ purchase });
      } else {
        throw new Error('Purchase not created. Please try again');
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function read(req: Request, res: Response, next: NextFunction) {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (purchase === null) {
      return res.status(400).json({
        error: 'Purchase not found',
      });
    } else {
      return res.status(200).json({ purchase });
    }
  } catch (error) {
    console.log('\n\nError getting purchase: ', error, '\n\n');
    next({ status: 500, error: 'Db error getting purchase' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const {
      id,
      supplierId,
      productId,
      quantity,
      unitCost,
      unitPrice,
      location,
      description,
    } = req.body;

    const purchase = await Purchase.findByPk(id);
    if (purchase === null) {
      return res.status(400).json({
        error: 'Purchase not found',
      });
    }

    const supplier = Supplier.findByPk(supplierId);
    if (supplier === null) {
      return res.status(400).json({
        error: 'Supplier not found',
      });
    }

    const product = await Product.findByPk(productId);
    if (product === null) {
      return res.status(400).json({
        error: 'Product not found',
      });
    }

    return await sequelize.transaction(async (t) => {
      let { store } = product.dataValues!;
      const prevLocation = purchase.dataValues!.location;
      const prevUnitCost = purchase.dataValues!.unitCost
      const prevUnitPrice= purchase.dataValues!.unitPrice
      const prevQuantity = purchase.dataValues!.quantity;

      if (location === 'store') {
        if (store < 0) {
          throw new Error(
            'Purchase update will result in a negative value for items in store'
          );
        }

        if (quantity > prevQuantity) {
          store += prevQuantity;
        }

        if (quantity < prevQuantity) {
          store -= quantity;
        }
      }

      const totalPrice = unitCost * quantity;
      const [affectedPurchaseRow] = await Purchase.update(
        {
          supplierId,
          productId,
          quantity,
          unitCost,
          unitPrice,
          location,
          description,
          totalPrice,
        },
        {
          where: { id },
          transaction: t,
        }
      );

      const [affectedProductRow] = await Product.update(
        { store, unitCost, unitPrice },
        {
          where: { id: productId },
          transaction: t,
        }
      );

      if (affectedPurchaseRow === 1 && affectedProductRow === 1) {
        return res.status(200).json({ purchase });
      } else {
        throw new Error('Purchase not updated. Please try again');
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function destroy(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const affectedRows = await Purchase.destroy({ where: { id } });
    if (affectedRows !== id.length) {
      const notDeleted = id.length - affectedRows;
      return res.status(400).json({
        error: `${
          notDeleted > 1 ? `${notDeleted} purchases` : 'Purchase'
        } not deleted. Please try again`,
      });
    } else {
      return res.status(200).json({
        message: `${
          id.length > 1 ? `${id.length} purchases` : 'Purchase'
        } deleted successfully`,
      });
    }
  } catch (error) {
    console.log('\n\nError deleting purchase(s) ', error, '\n\n');
    next({ status: 500, error: 'Db error deleting purchase(s)' });
  }
}

export { purchases, create, read, update, destroy };
