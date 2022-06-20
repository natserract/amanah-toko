import React, { useMemo, useEffect, useCallback, useState } from 'react';

import { useGetProductsQuery, useDestroyProductMutation } from './productSlice';
import DataTable from '../../app/table/DataTable';
import { Input } from '../../app/form/fields';
import { Message } from '../../app/index';
import { Category } from '../api';
import { useParams } from 'react-router-dom';
import { useGetCategoryQuery } from '../category/categorySlice';

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

export const ProductsListCategory = React.memo(() => {
  const params = useParams()

  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<Message | null>(null);

  const category = useGetCategoryQuery((params as any)?.categoryId)
  const result = useGetProductsQuery(query);
  const [destroyProduct] = useDestroyProductMutation();

  const cols = useMemo(
    () => [
      { name: 'Nama', accessor: 'name', link: '/products/:id' },
      { name: 'Harga Beli', accessor: 'unitCost', type: 'price' },
      { name: 'Harga Jual', accessor: 'unitPrice', type: 'price' },
      { name: 'Jumlah Stok', accessor: 'store' },
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
      setMessage({ type: 'danger', message: result.data?.error });
    }
  }, [result, result.data?.error]);

  const handleQuery = useCallback((query: string) => {
    if (query.length && Object.keys(params).length > 0) {
      const { categoryId  } = params as {
        categoryId: string
      }
      setQuery(`${query}&category=${categoryId}`);
    }
  }, [params]);

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
      title={`Kategori ${category?.data?.category?.name}`}
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
