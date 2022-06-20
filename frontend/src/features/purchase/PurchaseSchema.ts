import * as Yup from 'yup';

const PurchaseSchema = Yup.object({
  supplierId: Yup.string()
    .typeError('Supplier is required')
    .required('Supplier is required'),

  productId: Yup.string()
    .typeError('Product is required')
    .required('Product is required'),

  quantity: Yup.number()
    .typeError('Quantity is required')
    .required('Quantity is required')
    .positive('Quantity must be greater than 0')
    .integer('Quantity must be an integer'),

  unitCost: Yup.string()
    .required('Unit cost is required'),

  unitPrice: Yup.string()
    .required('Unit price is required'),

  location: Yup.mixed().oneOf(
    ['store', 'counter'],
    "Valid location are 'store' or 'counter'"
  ),

  description: Yup.string()
    .min(5, 'Description should be at least 5 characters long')
    .max(255, 'Description should not exceed 255 characters'),
});

export default PurchaseSchema;
