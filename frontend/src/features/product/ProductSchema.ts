import * as Yup from 'yup';

export const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .typeError('Product name is required')
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters long')
    .max(50, 'Product name must not exceed 50 characters'),

  unitCost: Yup.string()
    .required('Unit cost is required'),


  unitPrice: Yup.string()
    .required('Unit price is required')
    .test(
      'notLessThanUnitCost',
      'Unit price cannot be less than unit cost',
      function (value) {
        const unitCost = parseFloat(this.parent.unitCost);
        if (unitCost) {
          // @ts-ignore
          return parseFloat(value) >= unitCost;
        }
        return true;
      }
    ),

  store: Yup.number()
    .typeError('Please provide a valid number for items in store')
    .required('Number of items in store is required')
    .positive('Items in store cannot be negative')
    .integer('Items in store must be an integer'),

  description: Yup.string()
    .min(5, 'Description should be at least 5 characters long')
    .max(255, 'Description should not exceed 255 characters'),
});
