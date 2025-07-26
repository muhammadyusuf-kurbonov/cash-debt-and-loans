'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { contactsWithBalanceView, contactTable } from '@/db/schema';
import { motion } from 'framer-motion';
import { NotebookText, PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AddContactButton } from './add-contact-modal';
import { CurrenciesModal } from './currencies-modal';
import { Money } from './money';
import { TopRightMenu } from './top-right-menu';

type Props = {
  contacts: Array<typeof contactsWithBalanceView.$inferSelect>,
  onNewContactCreate: (newContact: typeof contactTable.$inferInsert & { balance: number }) => void,
  onContactClick: (contact: typeof contactsWithBalanceView.$inferSelect) => void,
  onContactViewLogClick: (contact: typeof contactsWithBalanceView.$inferSelect) => void,
}

export function ContactList({ contacts, onNewContactCreate, onContactClick, onContactViewLogClick }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleViewLogClick = (event: React.MouseEvent<HTMLButtonElement>, contact: typeof contactsWithBalanceView.$inferSelect) => {
    event.preventDefault();
    event.stopPropagation();
    onContactViewLogClick(contact);
    // Handle view log click
  }

  const groupByContacts = useMemo(() => {
    console.log('contacts', contacts); // Log the contacts array to check if it's being passed correctly
    const groupsAsArrays: Array<typeof contactsWithBalanceView.$inferSelect[]> = [];
    const idToIndexMap = new Map();

    contacts.forEach(contact => {
      const key = contact.id;
      if (!idToIndexMap.has(key)) {
        // If this ID is seen for the first time, create a new group and record its index
        idToIndexMap.set(key, groupsAsArrays.length);
        groupsAsArrays.push([]);
      }
      // Add the contact to the correct group
      groupsAsArrays[idToIndexMap.get(key)].push(contact);
    });

    return groupsAsArrays.map((group) => ({
      contact: group[0],
      balances: group,
    }));
  }, [contacts]);

  const handleCurrenciesMenuClick = () => {
    setIsDropdownOpen(false);
    setIsCurrencyModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Contacts</h1>
        <div className='flex flex-row space-x-2'>
          <Button variant="outline" className="flex items-center" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="w-5 h-5 mr-2" /> Add Contact
          </Button>
          <TopRightMenu
            dropdownOpen={isDropdownOpen}
            onDropdownOpenChange={setIsDropdownOpen}
            openCurrencyList={handleCurrenciesMenuClick}
          />
        </div>
      </div>
      <ul className="space-y-4">
        {!contacts.length && (<div>
          <div className="w-full h-[300px flex items-center justify-center">
            <div>No contacts found. Add a new one!</div>
          </div>
        </div>)}
        {groupByContacts.map((group) => (
          <motion.li key={group.contact.id} layout
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 120
            }}>
            <Card key={group.contact.id} className="flex flex-row items-center justify-center p-4 cursor-pointer" onClick={() => onContactClick(group.contact)}>
              <CardContent className="flex-1">
                <h2 className="text-lg font-semibold">{group.contact.fullName}</h2>
                {group.balances.map(account => (<Money label='Balance:' value={account.balance} symbol={account.currencySymbol} key={account.currencyId} />))}
              </CardContent>
              <Button variant="outline" size="icon" onClickCapture={(event) => handleViewLogClick(event, group.contact)}>
                <NotebookText />
              </Button>
            </Card>
          </motion.li>
        ))}
      </ul>
      <AddContactButton open={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onNewContactCreate} />
      <CurrenciesModal open={isCurrencyModalOpen} onOpenChange={setIsCurrencyModalOpen} />
    </div>
  );
}
