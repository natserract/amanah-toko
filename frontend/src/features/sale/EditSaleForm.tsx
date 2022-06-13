import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { Formik } from 'formik';

import {
  useGetSaleQuery,
  useEditSaleMutation,
  useCancelSaleMutation,
  useDestroySaleMutation,
} from './salesSlice';
import { useGetProductsQuery } from '../product/productSlice';
import { Input, Select, TextArea } from '../../app/form/fields';
import FormCard from '../../app/card/FormCard';
import Modal from '../../app/modal/Modal';
import Spinner from '../../app/spinners/Spinner';
import ButtonSpinner from '../../app/spinners/ButtonSpinner';
import SaleSchema from './SaleSchema';
import { Message } from '../../app/index';
import { Product } from '../api';
import { formatDate } from '../../utils/format';

type TParams = { saleId: string };

export const EditSaleForm = ({ match }: RouteComponentProps<TParams>) => {
  const { saleId } = match.params;
  const [message, setMessage] = useState<Message | null>(null);
  const result = useGetSaleQuery(saleId);

  const [updateSale] = useEditSaleMutation();
  const [cancelSale] = useCancelSaleMutation();
  const [destroySale] = useDestroySaleMutation();
  const allProducts = useGetProductsQuery('?limit=all');

  const invoiceDate = useMemo(() => {
    if (result?.data?.sale) {
      const { createdAt }  = result.data.sale
      return formatDate(createdAt)
    }

    return '-'
  }, [result])

  const products = useMemo(() => {
    if (allProducts.isSuccess && allProducts.data.products) {
      return allProducts.data.products.map((product: Product) => ({
        value: product.id,
        label: product.name,
      }));
    }
    return [{ value: '', label: 'No results found' }];
  }, [allProducts.isSuccess, allProducts.data?.products]);

  const initialValues = useMemo(() => {
    if (result.isSuccess && result.data.sale) {
      console.log('result.data.sale', result.data.sale)
      return { ...result.data.sale };
    } else {
      return { productId: '', quantity: '', description: '', };
    }
  }, [result.isSuccess, result.data?.sale]);

  const history = useHistory();

  useEffect(() => {
    if (message?.type && message?.message) {
      window.scrollTo(0, 0);
    }
  }, [message?.type, message?.message]);

  const handleDestroy = useCallback(async () => {
    if (saleId.length) {
      try {
        const { message, error, invalidData } = await destroySale(
          saleId
        ).unwrap();
        if (message) {
          history.push({
            pathname: '/sales',
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
  }, [saleId, history, destroySale]);

  const handleCancel = useCallback(async () => {
    if (saleId.length) {
      try {
        const { message, error, invalidData } = await cancelSale(
          saleId
        ).unwrap();
        if (message) {
          history.push({
            pathname: '/sales',
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
  }, [saleId, history, cancelSale]);

  const form = (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={SaleSchema}
      onSubmit={async (values, actions) => {
        try {
          const { sale, error, invalidData } = await updateSale(
            values
          ).unwrap();
          actions.setSubmitting(false);
          if (sale) {
            const message = {
              type: 'success',
              message: 'Sale updated successfully',
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
          {result.isFetching ? (
            <Spinner />
          ) : (
            <form onSubmit={props.handleSubmit}>
              <Select
                name="productId"
                label="Pilih Produk"
                options={products}
                required={true}
              >
                <option value="">Pilih Produk</option>
              </Select>
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
                placeholder="Masukkan Deskripsi Barang"
              />
              <Input
                name="createdAt"
                value={invoiceDate}
                readOnly
                label="Tanggal"
              />

              <button
                type="submit"
                className="btn btn-primary rounded-0 me-2 mt-3"
                disabled={props.isSubmitting}
              >
                {props.isSubmitting ? (
                  <ButtonSpinner text="Mengupdate" />
                ) : (
                  'Update'
                )}
              </button>

              <button
                type="button"
                className="btn btn-danger rounded-0 me-2 mt-3"
                data-bs-toggle="modal"
                data-bs-target="#cancelSale"
              >
                Batal
              </button>

              <button
                type="button"
                className="btn btn-danger rounded-0 mt-3"
                data-bs-toggle="modal"
                data-bs-target="#deleteSale"
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
        title="Edit Penjualan"
        message={message}
        setMessage={setMessage}
        cardBody={form}
      />

      <Modal
        id="deleteSale"
        label="deleteSaleLabel"
        title="Hapus Penjualan"
        body="Apakah Anda yakin ingin menghapus penjualan ini? Aksi ini tidak bisa di undo."
        handleAction={handleDestroy}
      />

      <Modal
        id="cancelSale"
        label="cancelSaleLabel"
        title="Batalkan Penjualan"
        body="Apakah Anda yakin ingin membatalkan penjualan ini? Aksi ini tidak bisa di undo."
        handleAction={handleCancel}
        actionLabel="Submit"
      />
    </>
  );
};
