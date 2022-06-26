import { useMemo, useRef, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import Invoice from "../../app/invoice";
import { Sale } from "../api";
import { useGetSaleQuery, useGetSalesQuery } from "./salesSlice";

import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'

import { useReactToPrint } from 'react-to-print';

type TParams = { saleId: string };

const PurchaseInvoiceToday = ({ match }: RouteComponentProps<TParams>) => {
  const componentRef = useRef(null);

  const [query, setQuery] = useState('')
  const sales = useGetSalesQuery(query);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { saleId } = match.params;
  const fetchSale = useGetSaleQuery(saleId);

  const sale = useMemo((): Sale => {
    if (fetchSale.isSuccess && fetchSale.data.sale) {
      const _sale = { ...fetchSale.data.sale };
      return _sale;
    }

    return {} as Sale
  }, [fetchSale])

  useEffect(() => {
    const timestamp = new Date()
    const startDay = startOfDay(timestamp).toISOString()
    const endDay = endOfDay(timestamp).toISOString()

    setQuery(`?from=${startDay}&to=${endDay}`)
  }, [])

  useEffect(() => {
    console.log('sales', sales)
  }, [sales])

  return (
    <div className="container-fluid pt-5">
      <Invoice
        type="sale"
        ref={componentRef}
        data={sale}
      />

      {/* Actions */}
      <div style={{
        marginTop: 50,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
      }}>

        <button
          className="btn btn-primary rounded-0"
          onClick={handlePrint}
        >
          Print Invoice
        </button>
      </div>
    </div>
  )
}

export default PurchaseInvoiceToday
