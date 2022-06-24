import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { Formik } from 'formik';

import {
  useGetPurchaseQuery,
  useEditPurchaseMutation,
  useDestroyPurchaseMutation,
} from './purchaseSlice';
import { useGetSuppliersQuery } from '../supplier/supplierSlice';
import { useGetProductsQuery } from '../product/productSlice';
import { Input, Select, CurrencyInput, TextArea, AutoComplete } from '../../app/form/fields';
import FormCard from '../../app/card/FormCard';
import Modal from '../../app/modal/Modal';
import Spinner from '../../app/spinners/Spinner';
import ButtonSpinner from '../../app/spinners/ButtonSpinner';
import PurchaseSchema from './PurchaseSchema';
import { Message } from '../../app/index';
import { Product, Supplier } from '../api';

type TParams = { purchaseId: string };

export const EditPurchaseForm = ({ match }: RouteComponentProps<TParams>) => {
  const { purchaseId } = match.params;
  const [message, setMessage] = useState<Message | null>(null);
  const result = useGetPurchaseQuery(purchaseId);
  const [updatePurchase] = useEditPurchaseMutation();
  const [destroyPurchase] = useDestroyPurchaseMutation();

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

  const initialValues = useMemo(() => {
    if (result.isSuccess && result.data.purchase) {
      const purchase = { ...result.data.purchase };
      if (purchase.description === null) {
        purchase.description = '';
      }

      return purchase
    } else {
      return {
        supplierId: '',
        productId: '',
        quantity: '',
        unitCost: '',
        unitPrice: '',
        location: 'store',
        description: '',
      };
    }
  }, [result.isSuccess, result.data?.purchase]);

  const history = useHistory();

  const [priceState, setPrice] = useState({
    unitCost: NaN,
    unitPrice: NaN
  })

  useEffect(() => {
    if (message?.type && message?.message) {
      window.scrollTo(0, 0);
    }
  }, [message?.type, message?.message]);

  useEffect(() => {
    if (result.data?.purchase) {
      const { unitCost, unitPrice } = result.data.purchase

      setPrice({
        unitCost: +unitCost,
        unitPrice: +unitPrice
      })
    }
  }, [result.data])

  console.log('initialValues', initialValues)

  const handleDestroy = useCallback(async () => {
    if (purchaseId.length) {
      try {
        const { message, error, invalidData } = await destroyPurchase(
          purchaseId
        ).unwrap();
        if (message) {
          history.push({
            pathname: '/purchases',
            state: { message: { type: 'success', message } },
          });
        }
        if (error) {
          setMessage({ type: 'danger', message: error });
        }
        if (invalidData) {
          setMessage({ type: 'danger', message: invalidData.id });
        }
      } catch (error) {
        setMessage({ type: 'danger', message: error.message });
      }
    }
  }, [purchaseId, history, destroyPurchase]);

  const currentProduct = useMemo(() => {
    if (initialValues.productId) {
      return products.find(product => {
        return product.value === initialValues?.productId
      })
    }
    return undefined
  }, [products, initialValues])

  const currentSupplier = useMemo(() => {
    if (initialValues.supplierId) {
      return suppliers.find(supplier => {
        return supplier.value === initialValues.supplierId
      })
    }
    return undefined
  }, [suppliers, initialValues])

  const form = (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={PurchaseSchema}
      onSubmit={async (values, actions) => {
        const { unitCost, unitPrice, ...formValues } = values;
        const newFormValues = {
          ...formValues,
          ...priceState,
        }

        try {
          const { purchase, error, invalidData } = await updatePurchase(
            // @ts-ignore
            {
            ...newFormValues,
            ...(values.description && {
              description: values.description
            })
            }
          ).unwrap();
          actions.setSubmitting(false);
          if (purchase) {
            const message = {
              type: 'success',
              message: 'Purchase updated successfully',
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
          {result.isFetching ? (
            <Spinner />
          ) : (
            <form onSubmit={props.handleSubmit}>
              {currentSupplier ? (
                <AutoComplete
                  defaultValue={currentSupplier}
                  options={suppliers}
                  name="supplierId"
                  label="Pilih Supplier"
                  required={true}
                />
              ) : "Loading..."}

              {currentProduct ? (
                <AutoComplete
                  defaultValue={currentProduct}
                  options={products}
                  name="productId"
                  label="Pilih Barang"
                  required={true}
                />
              ) : "Loading..."}

              <Input
                name="quantity"
                label="Jumlah"
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
              <TextArea name="description" label="Deskripsi" placeholder="Masukkan Deskripsi" />

              <button
                type="submit"
                className="btn btn-primary rounded-0 me-2 mt-3"
                disabled={props.isSubmitting}
              >
                {props.isSubmitting ? (
                  <ButtonSpinner text="Updating" />
                ) : (
                  'Update'
                )}
              </button>

              <button
                type="button"
                className="btn btn-danger rounded-0 mt-3"
                data-bs-toggle="modal"
                data-bs-target="#deletePurchase"
              >
                Hapus
              </button>
            </form>
          )}
        </>
      )}
    </Formik>
  );

  return (
    <>
      <FormCard
        title="Edit Pembelian"
        message={message}
        setMessage={setMessage}
        cardBody={form}
      />

      <Modal
        id="deletePurchase"
        label="deletePurchaseLabel"
        title="Hapus Pembelian"
        body="Apakah Anda yakin ingin menghapus pembelian ini?"
        handleAction={handleDestroy}
      />
    </>
  );
};
