import React, { useMemo, useEffect, useCallback, useState } from 'react';

import { useGetProductsQuery, useDestroyProductMutation } from './productSlice';
import DataTable from '../../app/table/DataTable';
import { Input } from '../../app/form/fields';
import { Message } from '../../app/index';
import { Category } from '../api';

const ProductsSearchForm = () => (
  <Input
    name="name"
    label="Name"
    type="search"
    placeholder="Masukkan Nama Barang"
    inline={true}
    validation={false}
  />
);

export const ProductsList = React.memo(() => {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const result = useGetProductsQuery(query);
  const [destroyProduct] = useDestroyProductMutation();
  const cols = useMemo(
    () => [
      { name: 'Nama', accessor: 'name', link: '/products/:id' },
      { name: 'Harga Beli', accessor: 'unitCost', type: 'price' },
      { name: 'Harga Jual', accessor: 'unitPrice', type: 'price' },
      { name: 'Jumlah Stok', accessor: 'store' },
      {
        name: 'Kategori',
        accessor: 'category',
        link: '/category/:categoryId',
        callback: (category: Category) => category.name,
      },
    ],
    []
  );

  const products = result.isSuccess
    ? result.data.products
      ? result.data.products
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
          const { message, error, invalidData } = await destroyProduct(
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
    [destroyProduct]
  );

  return (
    <DataTable
      cols={cols}
      data={products}
      pagination={
        result.isSuccess && result.data.pagination
          ? result.data.pagination
          : { count: 0 }
      }
      title="Barang"
      message={message}
      setMessage={setMessage}
      createItemLink="/products/create"
      handleQuery={handleQuery}
      destroyChecked={destroyChecked}
      searchFormInitialValues={{ name: '' }}
      SearchFormInputs={ProductsSearchForm}
    />
  );
});
