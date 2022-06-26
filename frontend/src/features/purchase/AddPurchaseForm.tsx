import { useEffect, useState, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';

import { useAddNewPurchaseMutation } from './purchaseSlice';
import { useAddNewProductMutation, useGetProductsQuery } from '../product/productSlice';
import { useGetSuppliersQuery } from '../supplier/supplierSlice';
import { Input, Select, CurrencyInput, TextArea, AutoComplete, Checkbox } from '../../app/form/fields';
import FormCard from '../../app/card/FormCard';
import ButtonSpinner from '../../app/spinners/ButtonSpinner';
import PurchaseSchema from './PurchaseSchema';
import { Category, Product, Supplier } from '../api';
import { Message } from '../../app/index';
import { useGetCategoriesQuery } from '../category/categorySlice';

export const AddPurchaseForm = () => {
  const [message, setMessage] = useState<Message | null>(null);
  const [priceState, setPrice] = useState({
    unitCost: 0,
    unitPrice: 0
  })

  const [addNewPurchase] = useAddNewPurchaseMutation();
  const [addNewProduct] = useAddNewProductMutation();

  const allProducts = useGetProductsQuery('?limit=all');
  const allSuppliers = useGetSuppliersQuery('?limit=all');
  const allCategories = useGetCategoriesQuery('?limit=all');

  const [isNewProduct, setIsNewProduct] = useState(false);

  const initialValues = {
    supplierId: '',
    productId: '',
    quantity: '',
    unitCost: '',
    unitPrice: '',
    location: 'store',
    description: '',

    // :: product state
    name: '',
    categoryId: '',
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

  const suppliers = useMemo(() => {
    if (allSuppliers.isSuccess && allSuppliers.data.suppliers) {
      return allSuppliers.data.suppliers.map((supplier: Supplier) => ({
        value: supplier.id,
        label: supplier.name,
      }));
    }
    return [{ value: '', label: 'No results found' }];
  }, [allSuppliers.isSuccess, allSuppliers.data?.suppliers]);

  const categories = useMemo(() => {
    if (allCategories.isSuccess && allCategories.data.categories) {
      return allCategories.data.categories.map((category: Category) => ({
        value: category.id,
        label: category.name,
      }));
    }

    return [{ value: '', label: 'No results found' }];
  }, [allCategories.isSuccess, allCategories.data?.categories]);

  const history = useHistory();

  const handleSubmit = useCallback(async(
    values: typeof initialValues,
    actions: FormikHelpers<typeof initialValues>
  ) => {
    const { unitCost, unitPrice, ...formValues } = values;

    const errorHandler = (
      error: string | undefined,
      invalidData: { [k: string]: string } | undefined
    ) => {
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
    }

    try {
      if (isNewProduct) {
        const formValuesProduct = {
          ...formValues,
          ...priceState,
          store: formValues.quantity,
        }
        const {
          product,
          error: errProduct,
          invalidData: invalidDataProduct
        } = await addNewProduct(
          {
            ...formValuesProduct,
            ...(values.description && {
              description: values.description
            })
          }
        ).unwrap();

        if (product) {
          const {
            purchase,
            error: errPurch,
            invalidData: invalidDataPurch
          } = await addNewPurchase({
            ...formValues,
            ...priceState,
            productId: product.id,
            isNewProduct: true,
          }).unwrap()
          actions.setSubmitting(false);

          if (purchase) {
            const message = {
              type: 'success',
              message: 'Data pembelian berhasil dibuat',
            };
            history.push({
              pathname: '/purchases',
              state: { message },
            });
          }
          errorHandler(errPurch, invalidDataPurch)
        }
        errorHandler(errProduct, invalidDataProduct)
      }

      const {
        purchase,
        error: errPurch,
        invalidData: invalidDataPurch
      } = await addNewPurchase({
        ...formValues,
        ...priceState,
        isNewProduct: false,
      }).unwrap();
      actions.setSubmitting(false);

      if (purchase) {
        const message = {
          type: 'success',
          message: 'Data pembelian berhasil dibuat',
        };
        history.push({
          pathname: '/purchases',
          state: { message },
        });
      }
      errorHandler(errPurch, invalidDataPurch)
    } catch (error) {
      setMessage({ type: 'danger', message: error.message });
    }
  }, [
    addNewProduct,
    addNewPurchase,
    history,
    isNewProduct,
    priceState
  ])

  useEffect(() => {
    if (message?.type && message?.message) {
      window.scrollTo(0, 0);
    }
  }, [message?.type, message?.message]);

  const form = (
    <Formik
      initialValues={initialValues}
      validationSchema={PurchaseSchema}
      validateOnChange
      onSubmit={handleSubmit}
    >
      {(props) => (
        <>
          <form onSubmit={props.handleSubmit}>
            <AutoComplete
              options={suppliers}
              name="supplierId"
              label="Pilih Supplier"
              required={true}
            />

            <Checkbox
              label='Buat barang baru'
              name="isNewProduct"
              onChange={(event) => {
                const checked = event.target.checked;
                setIsNewProduct(checked);
              }}
            />

            {isNewProduct ? (
              <Input
                name="name"
                label="Nama"
                type="text"
                placeholder="Masukkan Nama Barang"
                required={true}
              />
            ) : (
              <AutoComplete
                options={products}
                name="productId"
                label="Pilih Barang"
                required={true}
                disabled={isNewProduct}
              />
            )}

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

            {isNewProduct && (
              <Select
                name="categoryId"
                label="Kategori"
                options={categories}
                required={true}
              >
               <option value="">Pilih Kategori</option>
              </Select>
            )}

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
