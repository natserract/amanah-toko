import * as Yup from 'yup';

const PurchaseSchema = Yup.object({
  supplierId: Yup.string()
    .typeError('Supplier is required')
    .required('Supplier is required'),

  isNewProduct:
    Yup.boolean().default(false),

  productId: Yup.string().notRequired(),

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

  // :: Additional for new product
  name: Yup.string()
    .notRequired()
    .min(2, 'Product name must be at least 2 characters long')
    .max(50, 'Product name must not exceed 50 characters'),

  categoryId: Yup.string()
    .notRequired(),
});

export default PurchaseSchema;
