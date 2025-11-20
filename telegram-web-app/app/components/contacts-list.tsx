import { motion } from 'framer-motion';
import { NotebookText, PlusCircle, SquarePen, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Contact, ContactResponseDto, CreateContactDto, UpdateContactDto } from '~/api/api-client';
import { AddContactButton } from './add-contact-modal';
import { CurrenciesModal } from './currencies-modal';
import { EditContactModal } from './edit-contact-modal';
import { Money } from './money';
import { TelegramLinkButton } from './telegram-link-button';
import { TopRightMenu } from './top-right-menu';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useTelegramData } from '~/lib/useTelegramData';

type Props = {
  contacts: Array<ContactResponseDto>;
  onNewContactCreate: (newContact: CreateContactDto) => void;
  onContactClick: (contact: Contact) => void;
  onContactEdit: (id: number, updatedContact: UpdateContactDto) => void;
  loading?: boolean;
}

export function ContactList({ contacts, onNewContactCreate, onContactClick, onContactEdit, loading }: Props) {
  const { isTelegram } = useTelegramData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const navigate = useNavigate();

  const handleViewLogClick = (event: React.MouseEvent<HTMLButtonElement>, contact: Contact) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/transactions?contactId=${contact.id}&contactName=${encodeURIComponent(contact.name || 'Contact')}`);
  }

  const handleCurrenciesMenuClick = () => {
    setIsDropdownOpen(false);
    setIsCurrencyModalOpen(true);
  };

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>, contact: Contact) => {
    event.preventDefault();
    event.stopPropagation();
    setContactToEdit(contact);
    setIsEditModalOpen(true);
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
        {!contacts.length && (
          <div>
            <div className="w-full h-[300px] flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <div>Loading contacts...</div>
                </div>
              ) : (
                <div>No contacts found. Add a new one!</div>
              )}
            </div>
          </div>
        )}
        {contacts.map((contact) => (
          <motion.li 
            key={contact.id} 
            layout
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 120
            }}
          >
            <Card 
              key={contact.id} 
              className="flex flex-row items-center justify-center p-4 cursor-pointer" 
              onClick={() => onContactClick(contact)}
            >
              <CardContent className="flex-1">
                <h2 className="text-lg font-semibold">{contact.name}</h2>
                {contact.Balance.map((balance) => (
                  <Money 
                    label='Balance:' 
                    value={balance.amount}
                    symbol={balance.currency?.symbol} 
                    key={balance.currency?.id} 
                  />
                ))}
              </CardContent>
              <div className="flex space-x-2">
                {!contact.ref_user_id && isTelegram && (
                  <TelegramLinkButton
                    contactId={contact.id}
                    contactName={contact.name || 'Unnamed Contact'}
                  />
                )}
                <Button variant="outline" size="icon" onClickCapture={(event) => handleEditClick(event, contact)}>
                  <SquarePen />
                </Button>
                <Button variant="outline" size="icon" onClickCapture={(event) => handleViewLogClick(event, contact)}>
                  <NotebookText />
                </Button>
              </div>
            </Card>
          </motion.li>
        ))}
      </ul>
      <AddContactButton open={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onNewContactCreate} />
      <EditContactModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        contactToEdit={contactToEdit} 
        onEdit={onContactEdit} 
      />
      <CurrenciesModal open={isCurrencyModalOpen} onOpenChange={setIsCurrencyModalOpen} />
    </div>
  );
}