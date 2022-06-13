import format from 'date-fns/format';

type Value = string | number | boolean | Date | null | undefined;

const DEFAULT_DATE_FORMAT = 'dd MMM yyyy';

export function formatDate(value: Value): string {
  const dateFormat = DEFAULT_DATE_FORMAT;
  let formattedDate = '';

  if (value) {
    const newDate = new Date(value as string | Date);

    if (!isNaN(newDate.getTime())) {
      formattedDate = format(new Date(newDate?.toISOString()), dateFormat);
    }
  }

  if (value === 'Invalid DateTime') {
    return '';
  }

  return formattedDate;
}
