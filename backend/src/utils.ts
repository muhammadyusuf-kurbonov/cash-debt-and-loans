import { Balance, Currency } from 'generated/prisma';

export function formatCurrency(number: number): string {
  return number.toLocaleString('ru', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  });
}

export function formatBalance(balance: Balance & { currency: Currency }) {
  return `${formatCurrency(balance.amount)} ${balance.currency.symbol}`;
}
