import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Formik } from 'formik';

import { useAddNewSaleMutation } from './salesSlice';
import { useGetProductsQuery } from '../product/productSlice';
import { Input, Select, TextArea, AutoComplete } from '../../app/form/fields';
import FormCard from '../../app/card/FormCard';
import ButtonSpinner from '../../app/spinners/ButtonSpinner';
import SaleSchema from './SaleSchema';
import { Product } from '../api';
import { Message } from '../../app/index';

export const AddSaleForm = () => {
  const [message, setMessage] = useState<Message | null>(null);
  const [addNewSale] = useAddNewSaleMutation();
  const allProducts = useGetProductsQuery('?limit=all');

  const initialValues = {
    productId: '',
    quantity: '',
    description: '',
  }

  const products = useMemo(() => {
    if (allProducts.isSuccess && allProducts.data.products) {
      return allProducts.data.products.map((product: Product) => ({
        value: product.id,
        label: product.name,
      }));
    }
    return [{ value: '', label: 'No results found' }];
  }, [allProducts.isSuccess, allProducts.data?.products]);
  const history = useHistory();

  useEffect(() => {
    if (message?.type && message?.message) {
      window.scrollTo(0, 0);
    }
  }, [message?.type, message?.message]);

  const form = (
    <Formik
      initialValues={initialValues}
      validationSchema={SaleSchema}
      onSubmit={async (values, actions) => {
        try {
          const { sale, error, invalidData } = await addNewSale(
            values
          ).unwrap();
          actions.setSubmitting(false);
          if (sale) {
            const message = {
              type: 'success',
              message: 'Sale created successfully',
            };
            history.push({
              pathname: '/sales',
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
            <AutoComplete
              options={products}
              name="productId"
              label="Pilih Barang"
              required={true}
            />

            <Input
              name="quantity"
              label="Jumlah"
              type="number"
              placeholder="Masukkan Jumlah Barang"
              required={true}
            />
            <TextArea
              name="description"
              label="Deskripsi"
              placeholder="Masukkan Deskripsi Penjualan"
            />

            <button
              type="submit"
              className="btn btn-primary rounded-0 me-2 mt-3"
              disabled={props.isSubmitting}
            >
              {props.isSubmitting ? <ButtonSpinner text="Menambahkan" /> : 'Tambah'}
            </button>
          </form>
        </>
      )}
    </Formik>
  );

  return (
    <FormCard
      title="Tambah Penjualan"
      message={message}
      setMessage={setMessage}
      cardBody={form}
    />
  );
};
