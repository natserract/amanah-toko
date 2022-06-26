export function toRupiah(price: number, prefix = '.') {
  if (!price) return price;

  const p = price.toFixed(2).split('.');
  const currency = 'Rp';

  return (
    currency +
    p[0]
      .split('')
      .reverse()
      .reduce(function (acc, int, i) {
        return int + (int !== '-' && i && !(i % 3) ? prefix : '') + acc;
      }, '')
  );
}

export const numberFormat = (num: number) => {
  return num.toLocaleString(
    'id-ID', { style: 'currency', currency:'IDR', minimumFractionDigits: 0 }
  )
}


export const averageNum = (total: number, length: number) => {
  if (length > 0) {
    return total / length
  }

  return total
}
