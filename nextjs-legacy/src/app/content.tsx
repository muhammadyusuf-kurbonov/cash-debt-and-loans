'use client';

import { AddTransactionModal } from '@/components/add-transaction-modal';
import { ContactList } from '@/components/contacts-list';
import { contactsWithBalanceView, contactTable, transactionsTable } from '@/db/schema';
import { useTransitionRouter } from 'next-transition-router';
import { useCallback, useMemo, useState } from 'react';
import { addNewContact, addTransaction } from './actions';
import { StickyFooter } from '@/components/sticky-footer';
import { Money } from '@/components/money';

export default function HomePageContent({
  contacts,
}: {
  contacts: Array<typeof contactsWithBalanceView.$inferSelect>,
}) {
  const router = useTransitionRouter();
  const handleAddNewContact = useCallback(async (newContact: typeof contactTable.$inferInsert & { balance: number }) => {
    await addNewContact(newContact);
    router.refresh();
  }, [router]);

  const [activeContact, setActiveContact] = useState<number | null>(null);
  const handleAddNewTransaction = useCallback(async (newData: typeof transactionsTable.$inferInsert) => {
    await addTransaction(activeContact!, newData);
    setActiveContact(null);
    router.refresh();
  }, [activeContact, router]);

  const totalBalances = useMemo<Record<string, number>>(() => {
    return contacts.reduce((acc, contact) => {
      if (!acc[contact.currencySymbol]) {
        acc[contact.currencySymbol] = 0
      }
      acc[contact.currencySymbol] += contact.balance;
      return acc;
    }, {} as Record<string, number>);
  }, [contacts]);

  return (
    <>
      <ContactList contacts={contacts} onNewContactCreate={handleAddNewContact} onContactClick={(contact) => setActiveContact(contact.id)} onContactViewLogClick={(contact) => router.push(`/contacts/${contact.id}/transactions`)} />

      <StickyFooter className='max-w-2xl mx-auto'>
        <div className='flex flex-row w-full justify-between items-center gap-2'>
          <span className="text-gray-600 font-semibold">Total Balance:</span>
          <div className="text-right">
            { Object.entries(totalBalances).map(([symbol, value]) => (<Money value={value} symbol={symbol} key={symbol} />)) }
          </div>
        </div>
      </StickyFooter>

      <AddTransactionModal open={activeContact != null} onClose={() => setActiveContact(null)} onAdd={handleAddNewTransaction} />
    </>
  );
}