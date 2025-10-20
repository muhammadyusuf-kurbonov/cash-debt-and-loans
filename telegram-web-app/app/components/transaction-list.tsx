'use client'
import { format } from 'date-fns';
import { CircleX } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Money } from './money';
import type { Transaction, TransactionRelations } from '~/api/api-client';
import { cn } from '~/lib/utils';

type Props = {
  transactions: Array<Transaction & Pick<TransactionRelations, 'currency'>>;
  onDeleteTransaction: (id: number) => void;
};

export function TransactionsList({ transactions, onDeleteTransaction }: Props) {
  return (
    <div className="space-y-4 mb-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className={cn('p-4')}>
          <CardContent className={cn({ 'opacity-25': transaction.deletedAt })}>
            <div className='flex flex-row justify-between'>
              <div>
                <h2 className="text-lg font-semibold"><Money value={transaction.amount} symbol={transaction.currency.symbol}/></h2>
                <p className="text-sm text-gray-600">Description: {transaction.note || 'N/A'}</p>
                <p className="text-sm text-gray-600">Date: {format(new Date(transaction.createdAt), 'Pp')}</p>

              </div>
              {!transaction.deletedAt && <Button
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
