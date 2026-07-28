import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';

const bnLocale = { locale: bn } as const;

export function formatBnDate(iso: string, fmt = 'd MMMM yyyy'): string {
  try {
    return format(parseISO(iso), fmt, bnLocale);
  } catch {
    return iso;
  }
}

export function relativeBn(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, ...bnLocale });
  } catch {
    return iso;
  }
}

export function isUpcoming(iso: string): boolean {
  try {
    return isAfter(parseISO(iso), new Date());
  } catch {
    return false;
  }
}

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnNumber(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

export function classNames(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
