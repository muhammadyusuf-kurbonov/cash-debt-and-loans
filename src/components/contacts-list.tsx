'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { contactTable } from '@/db/schema';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import { useCallback, useState } from 'react';
import { AddContactButton } from './add-contact-modal';

type Props = {
  contacts: Array<typeof contactTable.$inferSelect>,
  onNewContactCreate: (newContact: typeof contactTable.$inferInsert) => void,
}

export function ContactList({ contacts, onNewContactCreate }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useTransitionRouter();

  const handleAdd = useCallback<(newContact: typeof contactTable.$inferInsert) => void>((newContact) => {
    onNewContactCreate(newContact);
    router.refresh();
  }, [onNewContactCreate, router]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Contacts</h1>
        <Button variant="outline" className="flex items-center" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add Contact
        </Button>
      </div>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="flex justify-center p-4 cursor-pointer" onClick={() => router.push(`/customers/${contact.id}/transactions`)}>
            <CardContent className="flex-1">
              <h2 className="text-lg font-semibold">{contact.fullName}</h2>
              <p
                className={cn(
                  'text-sm',
                  {
                    'text-green-600': contact.balance > 0,
                    'text-red-600': contact.balance < 0,
                    'text-gray-600': contact.balance === 0,
                  }
                )}
              >
                Balance: ${contact.balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <AddContactButton open={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
