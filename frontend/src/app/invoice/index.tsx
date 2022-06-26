import React from "react";
import { useEffect, useMemo } from "react";
import { Product, Products, Purchase, Sale } from "../../features/api"
import { useGetProductQuery, useLazyGetProductQuery } from "../../features/product/productSlice";
import { toRupiah } from "../../utils/currency";
import { formatDate } from "../../utils/format";

const BusinessInfo = {
  name: "Amanah Toko",
  addressHtml: `Jl. Kertapura Gg.<br/>Segina 6, No. 22`,
  owner: "Sulastri",
  paymentMethod: "Cash",
}

interface IProps {
  data: Purchase | Sale;
  type: "purchase" | "sale"
}

const Invoice = React.forwardRef<any, IProps>(({ data, type }, ref) => {
  const {
    invoice_no,
    createdAt,
    productId,
  } = data

  const [trigger, fetchProduct] = useLazyGetProductQuery();

  const product = useMemo((): Product => {
    if (fetchProduct.isSuccess && fetchProduct.data.product) {
      const product = { ...fetchProduct.data.product };
      return product;
    }

    return {} as Product
  }, [fetchProduct])

  useEffect(() => {
    if (productId && productId.length > 0) {
      trigger(productId)
    }
  }, [productId, trigger])

  return (
    <div ref={ref} className="invoice-box">
			<table cellPadding="0" cellSpacing="0">
        <thead>
          <tr className="top">
            <td className="title">
              Amanah Toko
            </td>

            <td colSpan={2}>
              Invoice #: {invoice_no}<br />
              Dibuat: {formatDate(createdAt)}<br />
              Jatuh Tempo: {formatDate(createdAt)}
            </td>
          </tr>

          <tr className="information">
            <td>
              {BusinessInfo.name}, <br/>
              <span dangerouslySetInnerHTML={{
                __html: BusinessInfo.addressHtml
              }} />
            </td>

            <td>
              {BusinessInfo.owner}
            </td>
          </tr>
        </thead>

        <tbody style={{ borderTop: "10px solid white" }}>
          <tr className="heading">
            <td>Metode Pembayaran</td>

            <td>{BusinessInfo.paymentMethod} #</td>
          </tr>

          <tr className="details">
            <td>Cash</td>

            <td>{data.totalPrice ? toRupiah(+data.totalPrice) : 0}</td>
          </tr>

          <tr className="heading">
            <td>Barang</td>
            <td>Harga</td>
          </tr>

          <tr className="item">
            <td>{product?.name} (Jml: {data.quantity})</td>

            <td>{
              type === 'purchase' ?
                (product?.unitCost ? toRupiah(+product.unitCost) : 0) :
                (product?.unitPrice ? toRupiah(+product.unitPrice) : 0)
              }</td>
          </tr>

          <tr className="total">
            <td></td>
            <td>Total: {data.totalPrice ? toRupiah(+data.totalPrice) : 0}</td>
          </tr>
          {/* ..add more tr here */}

        </tbody>
			</table>
		</div>
  )
})

export default Invoice
