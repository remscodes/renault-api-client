import type { DateFilter, DateType, Period } from '@remscodes/renault-api';
import { PERIOD_FORMATS } from '@remscodes/renault-api/dist/types/kamereon/kamereon.constants';
import dayjs from 'dayjs';
import type { PartialBy } from './shared.model';

export function dateFilterToParams({ start, end, period }: PartialBy<DateFilter, 'period'>, locale: string): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams({
    start: normalizeDate(start, locale, period),
    end: normalizeDate(end, locale, period)
  });

  if (period) params.set('type', period);

  return params;
}

export function normalizeDate(date: DateType, locale: string, period: Period = 'day'): string {
  return formatDate(date, PERIOD_FORMATS[period], locale);
}

export function formatDate(date: DateType, format: string, locale: string): string {
  return dayjs(date, { format, locale }).toString();
}
