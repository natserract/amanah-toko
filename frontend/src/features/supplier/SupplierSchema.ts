import * as Yup from 'yup';

const SupplierSchema = Yup.object({
  name: Yup.string()
    .typeError('Supplier name is required')
    .required('Supplier name is required')
    .min(2, 'Supplier name must be at least 2 characters long')
    .max(50, 'Supplier name must not exceed 20 characters')
    .matches(/^[aA-zZ\s]+$/, 'Supplier name must be alphabetic'),

  phone: Yup.number()
    .typeError('Phone number is required')
    .required('Phone number is required')
    .min(11, 'Phone number must be 10 characters long')
    .max(13, 'Phone number must be 13 characters long'),

  email: Yup.string().email('Please provide a valid email address'),
});

export default SupplierSchema;
