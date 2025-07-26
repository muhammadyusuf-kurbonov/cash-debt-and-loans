'use client'

import { addTransaction, cancelTransaction } from '@/app/actions';
import { AddTransactionModal } from '@/components/add-transaction-modal';
import { Money } from '@/components/money';
import { StickyFooter } from '@/components/sticky-footer';
import { TransactionsList } from '@/components/transactions-list';
import { Button } from '@/components/ui/button';
import { currencyTable, transactionsTable } from '@/db/schema';
import { PlusCircle } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export function TransactionsPageContent({
  transactions,
  contactId, 
}: {
  transactions: Array<typeof transactionsTable.$inferSelect & { currency: typeof currencyTable.$inferSelect }>,
  contactId: number,
}) {
  const [open, setOpen] = useState(false);
  const router = useTransitionRouter();
  const [topBarButtonRef, setTopBarButtonRef] = useState<HTMLElement|null>(null);

  const handleAdd = useCallback(async (newData: typeof transactionsTable.$inferInsert) => {
    await addTransaction(contactId, newData);
    setOpen(false);
    router.refresh();
  }, [contactId, router]);
  const handleCancel = useCallback(async (id: number) => {
    await cancelTransaction(id);
    setOpen(false);
    router.refresh();
  }, [router]);

  useEffect(() => {
    setTopBarButtonRef(document.getElementById('topbar-button'));
  }, []);

  const totalBalances = useMemo<Record<string, number>>(() => {
    return transactions.filter(transaction => !transaction.cancelled).reduce((acc, transaction) => {
      if (!acc[transaction.currency.symbol]) {
        acc[transaction.currency.symbol] = 0
      }
      acc[transaction.currency.symbol] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  return (
    <>
      { topBarButtonRef &&
        createPortal(
          <Button variant="outline" className="flex items-center" onClick={() => setOpen(true)}>
            <PlusCircle className="w-5 h-5 mr-2" /> Add Transaction
          </Button>,
          topBarButtonRef,
        )
      }

      <TransactionsList transactions={transactions} onDeleteTransaction={handleCancel}/>

      <StickyFooter>
        <div className='w-full flex flex-row justify-between items-center gap-2'>
          <span className="text-gray-600 font-semibold">Total Balance:</span>
          <div className="text-right">
            { Object.entries(totalBalances).map(([symbol, value]) => (<Money value={value} symbol={symbol} key={symbol} />)) }
          </div>
        </div>
      </StickyFooter>

      <AddTransactionModal open={open} onClose={() => setOpen(false)} onAdd={handleAdd}/>
    </>
  );
}