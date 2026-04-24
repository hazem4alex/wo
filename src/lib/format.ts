export function formatKWD(amount: number | string): string {
  return new Intl.NumberFormat('ar-KW', {
    style: 'currency',
    currency: 'KWD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(Number(amount))
}

export function formatNumber(n: number | string): string {
  return new Intl.NumberFormat('ar-KW').format(Number(n))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
