'use client'
import { currencyTable, transactionsTable } from '@/db/schema';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent } from './ui/card';

type Props = {
  transactions: Array<typeof transactionsTable.$inferSelect & { currency: typeof currencyTable.$inferSelect }>;
};

export function TransactionsList({ transactions }: Props) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4">
          <CardContent>
            <h2 className={cn('text-lg font-semibold', {
              'text-green-600' : transaction.amount >= 0,
              'text-red-600': transaction.amount < 0}
            )}>{transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} {transaction.currency.symbol}</h2>
            <p className="text-sm text-gray-600">Description: {transaction.description || 'N/A'}</p>
            <p className="text-sm text-gray-600">Date: {format(new Date(transaction.createdAt), 'Pp')}</p>
          </CardContent>
        </Card>
      ))}
      {transactions.length === 0 && (
        <div className="flex items-center justify-center p-4">
          <p>No transactions found.</p>
        </div>
      )}
    </div>)
}