export function formatCurrency(number: number): string {
  return number.toLocaleString('ru', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  });
}

/**
 * Structural, so it accepts a balance computed on read (see
 * `ContactBalance`) without importing the service layer.
 */
export function formatBalance(balance: {
  amount: number;
  currency: { symbol: string };
}) {
  return `${formatCurrency(balance.amount)} ${balance.currency.symbol}`;
}
