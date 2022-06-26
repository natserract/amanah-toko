import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGetReportsQuery } from './dashboardSlice';
import { months } from './constants/month';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Reports } from './features/api';
import { averageNum, numberFormat, toRupiah } from './utils/currency';
import CustomTooltip from './app/charts/CustomTooltip';
import { useLazyGetSalesQuery } from './features/sale/salesSlice';
import { useLazyGetPurchasesQuery } from './features/purchase/purchaseSlice';
import { csvDownload } from './app/libs/csvParser';
import { formatDate } from './utils/format';

const centerSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '30px 0',
}

const ChartHeader = ({
  title,
  options,
  onChange,
  onDownload,
}: {
  title: string,
  options: {
    label: string;
    value: string;
  }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDownload: (e: any) => void;
}) => {
  const selectOptions = (() => {
    if (options?.length) {
      return options.map((option) => {
        if (typeof option === 'string') {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        }
        return (
          <option key={`${option.value}`} value={option.value}>
            {option.label}
          </option>
        );
      });
    }
  })();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
      padding: '0 15px',
    }}>
       <h3>{title}</h3>

       <div style={{
        display: 'inline-flex',
        alignItems: "center",
       }}>
          <select
            className='btn btn-sm btn-dark'
            name="filter"
            onChange={onChange}
            style={{
              marginRight: 20,
            }}
          >
            {selectOptions}
          </select>
          <button onClick={onDownload} className="btn btn-sm btn-outline-dark">
            Download Laporan
          </button>
       </div>
    </div>
  )
}

const totalPrice = (items: any[]) => {
  if (items && items.length > 0) {
    if (items.length === 1) {
      return items[0].total;
    } else {
      return items.reduce((acc, curr) => acc.total + curr.total);
    }
  }
}

const Dashboard = () => {
  const [query, setQuery] = useState('')
  const result = useGetReportsQuery(query)

  const purchasesRef = useRef<Reports['purchases']>([]);
  const [purchasesChartData, setPurchasesChartData] = useState<Reports['purchases']>([])

  const salesRef = useRef<Reports['sales']>([]);
  const [salesChartData, setSalesChartData] = useState<Reports['sales']>([])

  const salesByProductRef = useRef<Reports['sales']>([]);
  const [salesByProductChartData, setSalesByProductChartData] = useState<Reports['salesByProduct']>([])

  const [triggerSales, {
    data: salesData
  }] = useLazyGetSalesQuery()

  const [triggerPurchases, {
    data: purchasesData
  }] = useLazyGetPurchasesQuery()

  const applyChartData = useCallback(() => {
    const purchases = result.isSuccess
      ? result.data.purchases
        ? result.data.purchases
        : []
      : null;

    const sales = result.isSuccess
      ? result.data.sales
        ? result.data.sales
        : []
      : null;

    const salesByProduct = result.isSuccess
      ? result.data.salesByProduct
        ? result.data.salesByProduct
        : []
      : null;

    if (purchases) {
      months.forEach((month, i) => {
        const indexMonth = i + 1;
        const activeItems =
          purchases.filter(val => +val.month === indexMonth)

        activeItems.forEach(activeItem => {
          return purchasesRef.current!.push({
            month: months[i],
            productCount: activeItem ? +activeItem.productCount : 0,
            total: activeItem ? +activeItem?.total : 0,
            supplier: {
              name:  activeItem.supplier?.name ?? ''
            }
          });
        })
      })

      setPurchasesChartData(purchasesRef.current)
      purchasesRef.current = []
    }

    if (sales) {
      months.forEach((month, i) => {
        const indexMonth = i + 1;
        const activeItems =
          sales.filter(val => +val.month === indexMonth)

        activeItems.forEach(activeItem => {
          return salesRef.current!.push({
            month: months[i],
            productCount: activeItem ? +activeItem.productCount : 0,
            total: activeItem ? +activeItem?.total : 0,
          });
        })
      })

      setSalesChartData(salesRef.current)
      salesRef.current = []
    }

    if (salesByProduct) {
      setSalesByProductChartData(salesByProduct)
    }
  }, [result])

  const getAverage = (items: any[]) => {
    if (items) {
      const price = averageNum(
        totalPrice(items),
        items?.length
      )
      return toRupiah(price)
    }

    return '-'
  }

  useEffect(applyChartData, [applyChartData])

  useEffect(() => {
    if (result.data?.error) {
      console.error('result.data?.error', result.data?.error)
    }
  }, [result.data, result.data?.error]);

  const handleDownloadPurchase = useCallback(() => {
    try {
      if (
        purchasesData &&
        purchasesData.purchases &&
        purchasesData.purchases.length > 0
      ) {
        const purchases = purchasesData.purchases.map(purchase => {
          return {
            'No Invoice': purchase.invoice_no,
            'Total Biaya': purchase.totalPrice ? toRupiah(+purchase.totalPrice) : "Rp.0",
            'Nama Barang': purchase?.product?.name,
            'Harga Beli Barang':
            purchase?.product?.unitCost ? toRupiah(+purchase.product.unitCost) : "Rp.0",
            'Jumlah Barang': purchase.quantity,
            'Supplier': purchase?.supplier?.name,
            'Tanggal': formatDate(purchase.createdAt),
          }
        })
        csvDownload(purchases)
      }
    } catch (err) {
      console.log('Failed to download')
    }
  }, [purchasesData])

  useEffect(handleDownloadPurchase, [handleDownloadPurchase])

  const handleDownloadSales= useCallback(() => {
    try {
      if (
        salesData &&
        salesData.sales &&
        salesData.sales.length > 0
      ) {
        const sales = salesData.sales.map(sale => {
          return {
            'No Invoice': sale.invoice_no,
            'Total Biaya': sale.totalPrice ? toRupiah(+sale.totalPrice) : "Rp.0",
            'Nama Barang': sale?.product?.name,
            'Harga Jual Barang':
              sale?.product?.unitPrice ? toRupiah(+sale.product.unitPrice) : "Rp.0",
            'Jumlah Barang': sale.quantity,
            'Tanggal': formatDate(sale.createdAt),
          }
        })
        csvDownload(sales)
      }
    } catch (err) {
      console.log('Failed to download')
    }
  }, [salesData])

  useEffect(handleDownloadSales, [handleDownloadSales])

  return (
    <div className="container-fluid pt-3">
      <div className="card border-0 rounded-0 text-white bg-success">
        <div className="card-body">
          <h2 className="card-title">Amanah Toko</h2>
          <p className="card-text">Selamat datang di Aplikasi Amanah Toko</p>
        </div>
      </div>

      <div style={{
        margin: '30px 0',
      }}>
        <ChartHeader
          title='Laporan Pembelian'
          options={[
            {
              label: "Berdasarkan Biaya",
              value: "purchaseByDefault"
            },
            {
              label: "Berdasarkan Supplier",
              value: "purchaseBySupplier"
            }
          ]}
          onChange={(e) => {
            const value = e.target.value
            setQuery(`?by=${value}`)
          }}
          onDownload={() => triggerPurchases()}
        />

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            width={800}
            height={300}
            data={purchasesChartData}
            margin={{
              top: 5,
              right: 30,
              left: 60,
              bottom: 15
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
            />
            <YAxis tickCount={30} tickFormatter={(value) => numberFormat(value)} />
            <Tooltip content={(props) => (
              <CustomTooltip
                payload={purchasesChartData!}
                {...props}
              >
                {(currData) => (
                   <React.Fragment>
                    {query === "?by=purchaseBySupplier" && (
                      <p>
                        Nama Supplier: {currData ? currData?.supplier?.name : " -- "}
                      </p>
                    )}
                    <p>
                      Total Barang: {currData ? currData.productCount : " -- "}
                    </p>
                    <p>
                      {"Total Biaya : "}
                      <em>{currData ? numberFormat(+currData.total) : " -- "}</em>
                    </p>
                  </React.Fragment>
                )}
              </CustomTooltip>
            ) }/>
            <Legend
              content={() => (
                <div style={{...centerSx}}>
                  <label>Rata-rata pengeluaran: {getAverage(purchasesChartData!)}</label>
                </div>
              )}
            />
            <Bar dataKey="productCount" maxBarSize={20} fill="#82ca9d" />
            <Bar dataKey="total" maxBarSize={20} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        margin: '30px 0',
      }}>
        <ChartHeader
          title='Laporan Penjualan'
          options={[
            {
              label: "Berdasarkan Biaya",
              value: "salesByDefault"
            },
          ]}
          onChange={(e) => {
            const value = e.target.value
            setQuery(`?by=${value}`)
          }}
          onDownload={() => triggerSales()}
        />

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            width={800}
            height={300}
            data={salesChartData}
            margin={{
              top: 5,
              right: 30,
              left: 60,
              bottom: 15
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
            />
            <YAxis tickCount={30} tickFormatter={(value) => numberFormat(value)} />
            <Tooltip content={(props) => (
              <CustomTooltip
                payload={salesChartData!}
                {...props}
              >
                {(currData) => (
                   <React.Fragment>
                    <p>
                      Total Barang: {currData ? currData.productCount : " -- "}
                    </p>
                    <p>
                      {"Total Biaya : "}
                      <em>{currData ? numberFormat(+currData.total) : " -- "}</em>
                    </p>
                  </React.Fragment>
                )}
              </CustomTooltip>
            ) }/>
            <Legend
              content={() => (
                <div style={{...centerSx}}>
                  <label>Rata-rata pendapatan: {getAverage(salesChartData!)}</label>
                </div>
              )}
            />
            <Bar dataKey="productCount" maxBarSize={20} fill="#82ca9d" />
            <Bar dataKey="total" maxBarSize={20} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        margin: '30px 0',
      }}>
        <ChartHeader
          title='Laporan Penjualan Berdasarkan Produk'
          options={[
            {
              label: "Berdasarkan Produk",
              value: "salesByDefault"
            },
          ]}
          onChange={(e) => {
            const value = e.target.value
            setQuery(`?by=${value}`)
          }}
          onDownload={() => triggerSales()}
        />

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            width={800}
            height={300}
            data={salesByProductChartData}
            margin={{
              top: 5,
              right: 30,
              left: 60,
              bottom: 15
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="product.name"
            />
            <YAxis tickCount={30} tickFormatter={(value) => numberFormat(value)} />
            <Tooltip content={(props) => (
              <CustomTooltip
                payload={salesChartData!}
                {...props}
              >
                {(currData) => (
                   <React.Fragment>
                    <p>
                      Total Barang: {currData ? currData.productCount : " -- "}
                    </p>
                    <p>
                      {"Total Biaya : "}
                      <em>{currData ? numberFormat(+currData.total) : " -- "}</em>
                    </p>
                  </React.Fragment>
                )}
              </CustomTooltip>
            ) }/>
            <Legend
              content={() => (
                <div style={{...centerSx}}>
                  <label>Rata-rata pendapatan: {getAverage(salesChartData!)}</label>
                </div>
              )}
            />
            <Bar dataKey="productCount" maxBarSize={20} fill="#82ca9d" />
            <Bar dataKey="total" maxBarSize={20} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
