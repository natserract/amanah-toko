import React, { useMemo, useEffect, useCallback, useState } from 'react';

import { useGetSalesQuery, useDestroySaleMutation } from './salesSlice';
import DataTable from '../../app/table/DataTable';
import { Input } from '../../app/form/fields';
import { Message } from '../../app/index';
import { Product } from '../api';

const SalesSearchForm = () => (
  <Input
    name="product"
    label="Barang"
    type="search"
    placeholder="Masukkan Nama Barang"
    inline={true}
    validation={false}
  />
);

export const SalesList = React.memo(() => {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const result = useGetSalesQuery(query);
  const [destroySale] = useDestroySaleMutation();
  const cols = useMemo(
    () => [
      {
        name: 'Invoice No',
        accessor: 'invoice_no',
        link: "/sales/:id",
        callback: (value: string) => `INV-${value}`
      },
      {
        name: 'Barang',
        accessor: 'product',
        link: '/products/:productId',
        callback: (product: Product) => product.name,
      },
      { name: 'Jumlah', accessor: 'quantity' },
      { name: 'Total', accessor: 'totalPrice', type: "price" },
      { name: 'Tanggal', accessor: 'createdAt', type: 'date' },
      {
         name: 'Invoice',
         accessor: '',
         link: "/sales/invoice/:id",
         callback: (id: string) => 'Lihat Invoice'
      },
    ],
    []
  );

  const sales = result.isSuccess
    ? result.data.sales
      ? result.data.sales
      : []
    : null;

  useEffect(() => {
    if (result.data?.error) {
      setMessage({ type: 'danger', message: result.data.error });
    }
  }, [result.data?.error]);

  const handleQuery = useCallback((query: string) => {
    if (query.length) {
      const sortInvNoQuery = `?sort=invoice_no desc`
      setQuery(`${sortInvNoQuery}&${query}`);
    }
  }, []);

  const destroyChecked = useCallback(
    async (checked: string[]) => {
      if (checked.length) {
        try {
          const { message, error, invalidData } = await destroySale(
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
    [destroySale]
  );

  return (
    <DataTable
      cols={cols}
      data={sales}
      pagination={
        result.isSuccess && result.data.pagination
          ? result.data.pagination
          : { count: 0 }
      }
      title="Penjualan (Barang Keluar)"
      message={message}
      setMessage={setMessage}
      createItemLink="/sales/create"
      handleQuery={handleQuery}
      destroyChecked={destroyChecked}
      searchFormInitialValues={{ product: '' }}
      SearchFormInputs={SalesSearchForm}
    />
  );
});
