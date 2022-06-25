import { Request, Response, NextFunction } from 'express';
import { db } from '../../models';

const { sequelize } = db;
const { Sale, Product } = db;

async function sales(req: Request, res: Response, next: NextFunction) {
  try {
    const { filter, pagination } = res.locals;
    const { count, rows } = await Sale.findAndCountAll({
      distinct: true,
      include: {
        model: Product,
        as: 'product',
      },
      ...filter,
    });

    if (count) {
      pagination.count = count;
      return res.status(200).json({ sales: rows, pagination });
    } else {
      return res.status(400).json({
        error: 'No sales found',
      });
    }
  } catch (error) {
    console.log('\n\nError getting sales: ', error, '\n\n');
    next({ status: 500, error: 'Db error getting sales' });
  }
}

async function create(req: Request, res: Response) {
  try {
    const { productId, quantity, description, unitPrice } = req.body;
    const product = await Product.findByPk(productId);
    if (product === null) {
      return res.status(400).json({
        error: 'Product not found',
      });
    } else if (product.dataValues!.store < quantity) {
      return res.status(400).json({
        error: `Only ${product.dataValues!.store} items are left in store`,
      });
    }

    return await sequelize.transaction(async (t) => {
      const totalPrice = product.dataValues!.unitPrice * quantity;
      const { count } = await Sale.findAndCountAll({
        distinct: true,
        include: {
          model: Product,
          as: 'product',
        },
      });
      const invoiceNo = String(count + 1);

      const sale = await Sale.create(
        { productId, quantity, totalPrice, description, invoiceNo },
        { transaction: t }
      );
      // deduct quantity items from product
      const store = product.dataValues!.store - quantity;
      const [affectedProductRows] = await Product.update(
        { store },
        {
          where: { id: productId },
          transaction: t,
        }
      );

      if (sale.dataValues && affectedProductRows === 1) {
        return res.status(201).json({ sale });
      } else {
        throw new Error('Sale not created. Please try again');
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function cancelSale(req: Request, res: Response) {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (sale === null) {
      return res.status(400).json({
        error: 'Sale not found',
      });
    }

    const product = await Product.findByPk(sale.dataValues!.productId);
    if (product === null) {
      return res.status(400).json({
        error: 'Product not found',
      });
    }

    return await sequelize.transaction(async (t) => {
      const store = product.dataValues!.store + sale.dataValues!.quantity;

      const [affectedProductRows] = await Product.update(
        { store },
        {
          where: { id: product.dataValues!.id },
          transaction: t,
        }
      );
      const affectedSaleRows = await Sale.destroy({
        where: { id: req.params.id },
        transaction: t,
      });

      if (affectedProductRows === 1 && affectedSaleRows === 1) {
        return res.status(200).json({
          message: 'Sale cancelled successfully',
        });
      } else {
        throw new Error('Sale not cancelled. Please try again');
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function read(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (sale === null) {
      return res.status(400).json({
        error: 'Sale not found',
      });
    } else {
      return res.status(200).json({ sale });
    }
  } catch (error) {
    console.log('\n\nError getting sale: ', error, '\n\n');
    next({ status: 500, error: 'Db error getting sale' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id, quantity, description, productId } = req.body;

    const sale = await Sale.findByPk(id);
    if (sale === null) {
      return res.status(400).json({
        error: 'Sale not found',
      });
    }

    const product = await Product.findByPk(sale.dataValues!.productId);
    if (product === null) {
      return res.status(400).json({
        error: 'Product not found',
      });
    }

    // if (sale.dataValues!.quantity === quantity) {
    //   return res.status(200).json({
    //     message: 'Sale updated successfully',
    //   });
    // }

    return await sequelize.transaction(async (t) => {
      const store =
        product.dataValues!.store + sale.dataValues!.quantity - quantity;

     const totalPrice = product.dataValues!.unitPrice * quantity;

      const [affectedProductRows] = await Product.update(
        { store },
        {
          where: { id: product.dataValues!.id },
          transaction: t,
        }
      );
      const [affectedSaleRows] = await Sale.update(
        { quantity, description, totalPrice, productId },
        {
          where: { id },
          transaction: t,
        }
      );

      if (affectedProductRows === 1 && affectedSaleRows === 1) {
        return res.status(200).json({ sale });
      } else {
        throw new Error('Sale not updated. Please try again');
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function destroy(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const affectedRows = await Sale.destroy({ where: { id } });
    if (affectedRows !== id.length) {
      const notDeleted = id.length - affectedRows;
      return res.status(400).json({
        error: `${
          notDeleted > 1 ? `${notDeleted} sales` : 'Sale'
        } not deleted. Please try again`,
      });
    } else {
      return res.status(200).json({
        message: `${
          id.length > 1 ? `${id.length} sales` : 'Sale'
        } deleted successfully`,
      });
    }
  } catch (error) {
    console.log('\n\nError deleting sale(s) ', error, '\n\n');
    next({ status: 500, error: 'Db error deleting sale(s)' });
  }
}

export { sales, create, cancelSale, read, update, destroy };
