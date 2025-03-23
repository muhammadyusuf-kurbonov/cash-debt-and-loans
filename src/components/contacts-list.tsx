'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { contactsWithBalanceView, contactTable } from '@/db/schema';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { NotebookText, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { AddContactButton } from './add-contact-modal';

type Props = {
  contacts: Array<typeof contactsWithBalanceView.$inferSelect>,
  onNewContactCreate: (newContact: typeof contactTable.$inferInsert & { balance: number }) => void,
  onContactClick: (contact: typeof contactsWithBalanceView.$inferSelect) => void,
  onContactViewLogClick: (contact: typeof contactsWithBalanceView.$inferSelect) => void,
}

export function ContactList({ contacts, onNewContactCreate, onContactClick, onContactViewLogClick }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewLogClick = (event: React.MouseEvent<HTMLButtonElement>, contact: typeof contactsWithBalanceView.$inferSelect) => {
    event.preventDefault();
    event.stopPropagation();
    onContactViewLogClick(contact);
    // Handle view log click
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Contacts</h1>
        <Button variant="outline" className="flex items-center" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add Contact
        </Button>
      </div>
      <ul className="space-y-4">
        {contacts.map((contact) => (
          <motion.li key={contact.id} layout
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 120
            }}>
            <Card key={contact.id} className="flex flex-row items-center justify-center p-4 cursor-pointer"  onClick={() => onContactClick(contact)}>
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
              <Button variant="outline" size="icon" onClickCapture={(event) => handleViewLogClick(event, contact)}>
                <NotebookText />
              </Button>
            </Card>
          </motion.li>
        ))}
      </ul>
      <AddContactButton open={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onNewContactCreate} />
    </div>
  );
}
