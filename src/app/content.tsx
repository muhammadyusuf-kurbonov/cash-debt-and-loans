'use client';

import { AddTransactionModal } from '@/components/add-transaction-modal';
import { ContactList } from '@/components/contacts-list';
import { contactsWithBalanceView, contactTable, transactionsTable } from '@/db/schema';
import { useTransitionRouter } from 'next-transition-router';
import { useCallback, useState } from 'react';
import { addNewContact, addTransaction } from './actions';

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

  const [activeContact, setActiveContact] = useState<number|null>(null);
  const handleAddNewTransaction = useCallback(async (newData: typeof transactionsTable.$inferInsert) => {
    await addTransaction(activeContact!, newData);
    setActiveContact(null);
    router.refresh();
  }, [activeContact, router]);
  
  return (
    <>
      <ContactList contacts={contacts} onNewContactCreate={handleAddNewContact} onContactClick={(contact) => setActiveContact(contact.id)} onContactViewLogClick={(contact) => router.push(`/contacts/${contact.id}/transactions`)}/>

      <AddTransactionModal open={activeContact != null} onClose={() => setActiveContact(null)} onAdd={handleAddNewTransaction}/>
    </>
  );
}