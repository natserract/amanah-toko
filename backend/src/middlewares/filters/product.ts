import Sequelize from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import processFilters from './processFilters.js';

const Op = Sequelize.Op;

export function product(req: Request, res: Response, next: NextFunction) {
  const { name, category } = req.query;
  const conditions = [];

  if (name) {
    conditions.push({
      name: {
        [Op.iLike]: `%${name}%`,
      },
    });
  }

  if (category?.length) {
    conditions.push({
      categoryId: category
    });
  }

  processFilters(req, res, next, conditions);
}
