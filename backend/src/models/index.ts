import sequelize from '../config/config';
import { CategoryFactory } from './category.js';
import { ProductFactory } from './product.js';
import { PurchaseFactory } from './purchase.js';
import { SaleFactory } from './sale.js';
import { SupplierFactory } from './supplier.js';
import { TransferFactory } from './transfer.js';
import { Db } from './types';

export const models: any = {
  Category: CategoryFactory(sequelize),
  Product: ProductFactory(sequelize),
  Purchase: PurchaseFactory(sequelize),
  Sale: SaleFactory(sequelize),
  Supplier: SupplierFactory(sequelize),
  Transfer: TransferFactory(sequelize),
};

export const initModel = async (withoutSync = false) => {
  // Create model associations
  Object.keys(models).forEach((modelKey) => {
    if ('associate' in models[modelKey].prototype) {
      models[modelKey].prototype.associate(models);
    }
  });

  if (!withoutSync) {
    await sequelize.sync();
  }
};

export const db: Db = {
  sequelize,
  ...models,
};
