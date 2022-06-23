import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  DataTypes,
  Optional,
  Sequelize,
  Model,
} from 'sequelize';
import { Product } from './product.js';
import { Models } from './types';

export enum Source {
  STORE = 'store'
}

interface TransferAttributes {
  id: string;
  quantity: number;
  source: Source;
  destination: Source;

  // foreign key
  productId?: string;
}

type TransferCreationAttributes = Optional<TransferAttributes, 'id'>;

export class Transfer
  extends Model<TransferAttributes, TransferCreationAttributes>
  implements TransferAttributes
{
  declare id: string;
  declare quantity: number;
  declare source: Source;
  declare destination: Source;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // foreign key
  productId?: string;

  declare dataValues?: Transfer;

  // model associations
  declare getProduct: BelongsToGetAssociationMixin<Product>;
  declare setProduct: BelongsToSetAssociationMixin<Product, Product['id']>;
  declare createProduct: BelongsToCreateAssociationMixin<Product>;

  // possible inclusions
  declare readonly product?: Product;

  // associations
  declare static associations: {
    product: Association<Transfer, Product>;
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

export const TransferFactory = (sequelize: Sequelize) => {
  return Transfer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'transfers',
      sequelize,
      indexes: [
        {
          unique: true,
          fields: ['source'],
        },
        {
          unique: true,
          fields: ['destination'],
        },
      ],
    }
  );
};
