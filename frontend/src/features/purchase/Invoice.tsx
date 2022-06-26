import { useMemo, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import Invoice from "../../app/invoice";
import { Purchase } from "../api";
import { useGetPurchaseQuery } from "./purchaseSlice";

import { useReactToPrint } from 'react-to-print';

type TParams = { purchaseId: string };

const PurchaseInvoice = ({ match }: RouteComponentProps<TParams>) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { purchaseId } = match.params;
  const fetchPurchase = useGetPurchaseQuery(purchaseId);

  const purchase = useMemo((): Purchase => {
    if (fetchPurchase.isSuccess && fetchPurchase.data.purchase) {
      const purchase = { ...fetchPurchase.data.purchase };
      return purchase;
    }

    return {} as Purchase
  }, [fetchPurchase])

  return (
    <div className="container-fluid pt-5">
      <Invoice
        type="purchase"
        ref={componentRef}
        data={purchase}
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

export default PurchaseInvoice
