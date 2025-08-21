export function formatCurrency(number: number): string {
  return number.toLocaleString('ru', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  });
}
