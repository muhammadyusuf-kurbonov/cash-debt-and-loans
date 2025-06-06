'use client'

import { addTransaction } from '@/app/actions';
import { AddTransactionModal } from '@/components/add-transaction-modal';
import { TransactionsList } from '@/components/transactions-list';
import { Button } from '@/components/ui/button';
import { currencyTable, transactionsTable } from '@/db/schema';
import { PlusCircle } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    setTopBarButtonRef(document.getElementById('topbar-button'));
  }, []);

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

      <TransactionsList transactions={transactions}/>

      <AddTransactionModal open={open} onClose={() => setOpen(false)} onAdd={handleAdd}/>
    </>
  );
}