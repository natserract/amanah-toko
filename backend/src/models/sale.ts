import {
  Sequelize,
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  DataTypes,
  Optional,
  Association,
} from 'sequelize';
import { Product } from './product.js';
import { Models } from './types.js';

interface SaleAttributes {
  id: string;
  quantity: number;
  description?: string;
  invoice_no?: string;
  totalPrice?: number;

  // foreign key
  productId?: string;

  createdAt?: Date | string | null | undefined;
}

type SaleCreationAttributes = Optional<SaleAttributes, 'id' | 'totalPrice' | 'invoice_no'>;

export class Sale
  extends Model<SaleAttributes, SaleCreationAttributes>
  implements SaleAttributes
{
  declare id: string;
  declare quantity: number;
  declare description?: string;

  declare invoice_no?: string;
  declare totalPrice?: number;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // foreign keys
  declare productId?: string;

  declare dataValues?: Sale;

  // model associations
  declare getProduct: BelongsToGetAssociationMixin<Product>;
  declare setProduct: BelongsToSetAssociationMixin<Product, Product['id']>;
  declare createProduct: BelongsToCreateAssociationMixin<Product>;

  // possible inclusions
  declare readonly products?: Product[];

  // associations
  declare static associations: {
    products: Association<Sale, Product>;
  };

  static associate(models: Models) {
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: {
        name: 'productId',
        allowNull: false,
      },
    });
  }
}

export const SaleFactory = (sequelize: Sequelize) => {
  return Sale.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      invoice_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'sales',
      sequelize,
      indexes: [
        {
          unique: true,
          fields: ['invoice_no'],
        },
      ],
    }
  );
};
