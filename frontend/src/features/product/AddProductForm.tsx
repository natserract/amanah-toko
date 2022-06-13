import { useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Formik } from 'formik';

import { useAddNewProductMutation } from './productSlice';
import { useGetCategoriesQuery } from '../category/categorySlice';
import { CurrencyInput, Input, Select, TextArea } from '../../app/form/fields';
import FormCard from '../../app/card/FormCard';
import ButtonSpinner from '../../app/spinners/ButtonSpinner';
import { ProductSchema } from './ProductSchema';
import { Message } from '../../app/index';
import { Category, DraftProduct } from '../api';

export const AddProductForm = () => {
  const [message, setMessage] = useState<Message | null>(null);

  const history = useHistory();

  const [addNewProduct] = useAddNewProductMutation();
  const result = useGetCategoriesQuery('?limit=all');

  const [priceState, setPrice] = useState({
    unitCost: 0,
    unitPrice: 0
  })

  const initialValues: DraftProduct = {
    name: '',
    unitCost: '',
    unitPrice: '',
    store: '',
    description: '',
    categoryId: '',
  }

  const categories = useMemo(() => {
    if (result.isSuccess && result.data.categories) {
      return result.data.categories.map((category: Category) => ({
        value: category.id,
        label: category.name,
      }));
    }

    return [{ value: '', label: 'No results found' }];
  }, [result.isSuccess, result.data?.categories]);

  useEffect(() => {
    if (message?.type && message?.message) {
      window.scrollTo(0, 0);
    }
  }, [message?.type, message?.message]);

  const form = (
    <Formik
      initialValues={initialValues}
      validationSchema={ProductSchema}
      onSubmit={async (values, actions) => {
        const { unitCost, unitPrice, description, ...formValues } = values;
        const newFormValues = {
          ...formValues,
          ...priceState,
        }

        try {
          const { product, error, invalidData } = await addNewProduct(
            {
              ...newFormValues,
              ...(values.description && {
                description: values.description
              })
            }
          ).unwrap();
          actions.setSubmitting(false);
          if (product) {
            const message = {
              type: 'success',
              message: 'Barang berhasil dibuat',
            };
            history.push({
              pathname: '/products',
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
              message: 'Harap check kembali errors dibawah ini',
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
            <Input
              name="name"
              label="Nama"
              type="text"
              placeholder="Masukkan Nama Barang"
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
                const { floatValue } = values;

                if (floatValue) {
                  setPrice((state) => ({
                    ...state,
                    unitPrice: floatValue
                  }))
                }
              }}
            />
            <Input
              name="store"
              label="Jumlah Barang"
              type="number"
              placeholder="Masukkan Jumlah Barang"
              required={true}
            />
            <Select
              name="categoryId"
              label="Kategori"
              options={categories}
              required={true}
            >
              <option value="">Pilih Kategori</option>
            </Select>
            <TextArea
              name="description"
              label="Deskripsi"
              placeholder="Masukkan Deskripsi Barang"
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
      title="Tambah Barang"
      message={message}
      setMessage={setMessage}
      cardBody={form}
    />
  );
};
