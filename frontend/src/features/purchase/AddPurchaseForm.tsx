import { useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Formik } from 'formik';

import { useAddNewPurchaseMutation } from './purchaseSlice';
import { useGetProductsQuery } from '../product/productSlice';
import { useGetSuppliersQuery } from '../supplier/supplierSlice';
import { Input, Select, CurrencyInput, TextArea } from '../../app/form/fields';
import FormCard from '../../app/card/FormCard';
import ButtonSpinner from '../../app/spinners/ButtonSpinner';
import PurchaseSchema from './PurchaseSchema';
import { Product, Supplier } from '../api';
import { Message } from '../../app/index';

export const AddPurchaseForm = () => {
  const [message, setMessage] = useState<Message | null>(null);
  const [priceState, setPrice] = useState({
    unitCost: 0,
    unitPrice: 0
  })

  const [addNewPurchase] = useAddNewPurchaseMutation();
  const allProducts = useGetProductsQuery('?limit=all');
  const allSuppliers = useGetSuppliersQuery('?limit=all');

  const products = useMemo(() => {
    if (allProducts.isSuccess && allProducts.data.products) {
      return allProducts.data.products.map((product: Product) => ({
        value: product.id,
        label: product.name,
      }));
    }
    return [{ value: '', label: 'No results found' }];
  }, [allProducts.isSuccess, allProducts.data?.products]);

  const suppliers = useMemo(() => {
    if (allSuppliers.isSuccess && allSuppliers.data.suppliers) {
      return allSuppliers.data.suppliers.map((supplier: Supplier) => ({
        value: supplier.id,
        label: supplier.name,
      }));
    }
    return [{ value: '', label: 'No results found' }];
  }, [allSuppliers.isSuccess, allSuppliers.data?.suppliers]);

  const history = useHistory();

  useEffect(() => {
    if (message?.type && message?.message) {
      window.scrollTo(0, 0);
    }
  }, [message?.type, message?.message]);

  const form = (
    <Formik
      initialValues={{
        supplierId: '',
        productId: '',
        quantity: '',
        unitCost: '',
        unitPrice: '',
        location: 'store',
        description: '',
      }}
      validationSchema={PurchaseSchema}
      validateOnChange

      onSubmit={async (values, actions) => {
        const { unitCost, unitPrice, ...formValues } = values;

        try {
          const { purchase, error, invalidData } = await addNewPurchase({
            ...formValues,
            ...priceState,
          }).unwrap();
          actions.setSubmitting(false);

          if (purchase) {
            const message = {
              type: 'success',
              message: 'Purchase created successfully',
            };
            history.push({
              pathname: '/purchases',
              state: { message },
            });
          }
          if (error) {
            setMessage({ type: 'danger', message: error });
          }
          if (invalidData) {
            actions.setErrors(invalidData);
            setMessage({
              type: 'danger',
              message: 'Please correct the errors below',
            });
          }
        } catch (error) {
          setMessage({ type: 'danger', message: error.message });
        }
      }}
    >
      {(props) => (
        <>
          <form onSubmit={props.handleSubmit}>
            <Select
              name="supplierId"
              label="Pilih Supplier"
              options={suppliers}
              required={true}
            >
              <option value="">Pilih Supplier</option>
            </Select>
            <Select
              name="productId"
              label="Pilih Barang"
              options={products}
              required={true}
            >
              <option value="">Pilih Barang</option>
            </Select>
            <Input
              name="quantity"
              label="Jumlah Barang"
              type="number"
              placeholder="Masukkan Jumlah Barang"
              required={true}
            />
           <CurrencyInput
              name="unitCost"
              label="Harga Beli"
              placeholder="Masukkan Harga Pembelian"
              required={true}
              onValueChange={(values) => {
                const { floatValue } = values;

                if (floatValue) {
                  setPrice((state) => ({
                    ...state,
                    unitCost: floatValue
                  }))
                }
              }}
            />
            <CurrencyInput
              name="unitPrice"
              label="Harga Jual"
              placeholder="Masukkan Harga Jual"
              required={true}
              onValueChange={(values) => {
                const { floatValue: unitPrice } = values;

                if (unitPrice) {
                  setPrice((state) => ({
                    ...state,
                    unitPrice
                  }))
                }
              }}
            />
            <TextArea
              name="description"
              label="Deskripsi"
              placeholder="Masukkan Deskripsi"
            />

            <button
              type="submit"
              className="btn btn-primary rounded-0 me-2 mt-3"
              disabled={props.isSubmitting}
            >
              {props.isSubmitting ? (
                <ButtonSpinner text="Menambahkan" />
              ) : (
                'Tambah'
              )}
            </button>
          </form>
        </>
      )}
    </Formik>
  );

  return (
    <FormCard
      title="Tambah Pembelian"
      message={message}
      setMessage={setMessage}
      cardBody={form}
    />
  );
};
