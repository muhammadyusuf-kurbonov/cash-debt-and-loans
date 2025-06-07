'use client'
import { currencyTable, transactionsTable } from '@/db/schema';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CircleX } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

type Props = {
  transactions: Array<typeof transactionsTable.$inferSelect & { currency: typeof currencyTable.$inferSelect }>;
  onDeleteTransaction: (id: number) => void;
};

export function TransactionsList({ transactions, onDeleteTransaction }: Props) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className={cn('p-4')}>
          <CardContent className={cn({ 'opacity-25': transaction.cancelled })}>
            <div className='flex flex-row justify-between'>
              <div>
                <h2 className={cn('text-lg font-semibold', {
                  'text-green-600': transaction.amount >= 0,
                  'text-red-600': transaction.amount < 0
                }
                )}>{transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} {transaction.currency.symbol}</h2>
                <p className="text-sm text-gray-600">Description: {transaction.description || 'N/A'}</p>
                <p className="text-sm text-gray-600">Date: {format(new Date(transaction.createdAt), 'Pp')}</p>

              </div>
              {!transaction.cancelled && <Button
                variant="outline" // Using ghost variant for a subtle, icon-only button
                size="icon" // Makes the button square and sized for an icon
                onClick={() => onDeleteTransaction(transaction.id)} // Pass transaction ID to the delete handler
                className="text-gray-500 hover:text-red-600 transition-colors" // Styling for hover effect
              >
                <CircleX size={20} /> {/* Trash icon */}
              </Button>}
            </div>
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