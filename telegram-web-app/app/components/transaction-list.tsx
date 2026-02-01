'use client'
import { format } from 'date-fns';
import { Edit3 } from 'lucide-react';
import { Button } from './ui/button';
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

  const getStatusBadge = (transaction: Transaction) => {
    if (transaction.deletedAt) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase">
          Cancelled
        </span>
      );
    }
    if (transaction.amount > 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">
          Received
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">
        Paid
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      {transactions.map((transaction, idx) => (
        <div
          key={transaction.id}
          className={cn(
            'flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
            idx < transactions.length - 1 && 'border-b border-gray-50 dark:border-gray-700',
            transaction.deletedAt && 'opacity-40'
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0',
              transaction.amount > 0
                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                : 'bg-rose-100 dark:bg-rose-900/20 text-rose-600'
            )}>
              <span className="material-symbols-outlined text-[20px]">
                {transaction.amount > 0 ? 'south_east' : 'north_east'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {editingNoteId === transaction.id ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={editNoteValue}
                    onChange={(e) => setEditNoteValue(e.target.value)}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm bg-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => saveNote(transaction.id)}>Save</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold truncate">{transaction.note || 'No description'}</span>
                    <button
                      onClick={() => handleEditNote(transaction.id, transaction.note ?? null)}
                      className="p-0.5 text-gray-400 hover:text-primary"
                    >
                      <Edit3 size={12} />
                    </button>
                  </div>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-2">
            <Money value={transaction.amount} symbol={transaction.currency.symbol} className="text-sm font-bold" />
            <div className="flex items-center gap-1">
              {getStatusBadge(transaction)}
              {!transaction.deletedAt && (
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
          <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
          <p>No transactions found.</p>
        </div>
      )}
    </div>
  );
}
