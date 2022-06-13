import React, { useMemo, useEffect, useCallback, useState } from 'react';

import {
  useGetPurchasesQuery,
  useDestroyPurchaseMutation,
} from './purchaseSlice';
import DataTable from '../../app/table/DataTable';
import { Input } from '../../app/form/fields';
import { Message } from '../../app/index';
import { Product, Supplier } from '../api';

const PurchasesSearchForm = () => (
  <>
    <Input
      name="product"
      label="Barang"
      type="search"
      placeholder="Masukkan Nama Barang"
      inline={true}
      validation={false}
    />
    <Input
      name="supplier"
      label="Supplier"
      type="search"
      placeholder="Masukkan Nama Supplier"
      inline={true}
      validation={false}
    />
  </>
);

export const PurchasesList = React.memo(() => {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const result = useGetPurchasesQuery(query);
  const [destroyPurchase] = useDestroyPurchaseMutation();
  const cols = useMemo(
    () => [
      {
        name: 'Barang',
        accessor: 'product',
        link: '/products/:productId',
        callback: (product: Product) => product.name,
      },
      {
        name: 'Supplier',
        accessor: 'supplier',
        link: '/suppliers/:supplierId',
        callback: (supplier: Supplier) => supplier.name,
      },
      { name: 'Jumlah Barang', accessor: 'quantity' },
      { name: 'Harga Beli', accessor: 'unitCost', type: "price" },
      { name: 'Harga Jual', accessor: 'unitPrice', type: "price" },
      { name: 'Tanggal', accessor: 'createdAt', type: 'date' },
    ],
    []
  );

  const purchases = result.isSuccess
    ? result.data.purchases
      ? result.data.purchases
      : []
    : null;

  useEffect(() => {
    if (result.data?.error) {
      setMessage({ type: 'danger', message: result.data.error });
    }
  }, [result.data?.error]);

  const handleQuery = useCallback((query: string) => {
    if (query.length) {
      setQuery(query);
    }
  }, []);

  const destroyChecked = useCallback(
    async (checked: string[]) => {
      if (checked.length) {
        try {
          const { message, error, invalidData } = await destroyPurchase(
            checked.join()
          ).unwrap();
          if (message) {
            setMessage({ type: 'success', message });
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
    },
    [destroyPurchase]
  );

  return (
    <DataTable
      cols={cols}
      data={purchases}
      pagination={
        result.isSuccess && result.data.pagination
          ? result.data.pagination
          : { count: 0 }
      }
      title="Pembelian (Barang Masuk)"
      message={message}
      setMessage={setMessage}
      createItemLink="/purchases/create"
      handleQuery={handleQuery}
      destroyChecked={destroyChecked}
      searchFormInitialValues={{ product: '', supplier: '' }}
      SearchFormInputs={PurchasesSearchForm}
    />
  );
});
