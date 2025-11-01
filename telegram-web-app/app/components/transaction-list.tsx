'use client'
import { format } from 'date-fns';
import { CircleX, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Money } from './money';
import type { Transaction, TransactionRelations } from '~/api/api-client';
import { cn } from '~/lib/utils';
import { useState } from 'react';

type Props = {
  transactions: Array<Transaction & Pick<TransactionRelations, 'currency'>>;
  onDeleteTransaction: (id: number) => void;
  onEditNote: (id: number, note: string) => void;
};

export function TransactionsList({ transactions, onDeleteTransaction, onEditNote }: Props) {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteValue, setEditNoteValue] = useState<string>('');

  const handleEditNote = (transactionId: number, currentNote: string | null) => {
    setEditingNoteId(transactionId);
    setEditNoteValue(currentNote || '');
  };

  const saveNote = (transactionId: number) => {
    onEditNote(transactionId, editNoteValue);
    setEditingNoteId(null);
    setEditNoteValue('');
  };

  return (
    <div className="space-y-4 mb-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className={cn('p-4')}>
          <CardContent className={cn({ 'opacity-25': transaction.deletedAt })}>
            <div className='flex flex-row justify-between'>
              <div>
                <h2 className="text-lg font-semibold"><Money value={transaction.amount} symbol={transaction.currency.symbol}/></h2>
                <div className="flex items-center">
                  {editingNoteId === transaction.id ? (
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={editNoteValue}
                        onChange={(e) => setEditNoteValue(e.target.value)}
                        className="border rounded p-1 mb-1"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => saveNote(transaction.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        Description: {transaction.note || 'N/A'}{' '}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(transaction.id, transaction.note ?? null)}
                          className="h-auto p-1 text-xs"
                        >
                          <Edit3 size={14} />
                        </Button>
                      </p>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Date: {format(new Date(transaction.createdAt), 'Pp')}</p>
              </div>
              {!transaction.deletedAt && <Button
                variant="outline"
                size="icon"
                onClick={() => onDeleteTransaction(transaction.id)}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <CircleX size={20} />
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
