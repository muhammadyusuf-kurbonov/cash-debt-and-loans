import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">People</h1>
        <div className="flex flex-row space-x-2">
          <Button
            variant="outline"
            className="flex items-center rounded-xl"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="material-symbols-outlined text-lg mr-1">person_add</span>
            Add
          </Button>
          <TopRightMenu
            dropdownOpen={isDropdownOpen}
            onDropdownOpenChange={setIsDropdownOpen}
            openCurrencyList={handleCurrenciesMenuClick}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="space-y-2">
        {!contacts.length && (
          <div className="w-full h-[300px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <div className="text-gray-500">Loading contacts...</div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <span className="material-symbols-outlined text-5xl mb-2 block">group_add</span>
                <p>No contacts yet. Add your first one!</p>
              </div>
            )}
          </div>
        )}

        {contacts.map((contact) => {
          const initials = getInitials(contact.name);
          const maxBalance = contact.Balance.length > 0
            ? Math.max(...contact.Balance.map(b => Math.abs(b.amount)))
            : 0;

          return (
            <motion.div
              key={contact.id}
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              onClick={() => onContactClick(contact)}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              {/* Avatar */}
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {initials}
              </div>

              {/* Name + Balance */}
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold truncate">{contact.name || 'Unnamed'}</h2>
                {contact.Balance.map((balance) => (
                  <div key={balance.currency?.id} className="mt-1">
                    <div className="flex items-center justify-between text-xs">
                      <Money value={balance.amount} symbol={balance.currency?.symbol} className="text-xs font-semibold" />
                    </div>
                    {maxBalance > 0 && (
                      <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className={`h-full rounded-full ${balance.amount > 0 ? 'bg-primary' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, (Math.abs(balance.amount) / maxBalance) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!contact.ref_user_id && isTelegram && (
                  <TelegramLinkButton
                    contactId={contact.id}
                    contactName={contact.name || 'Unnamed Contact'}
                  />
                )}
                <button
                  onClick={(e) => handleEditClick(e as any, contact)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">edit</span>
                </button>
                <button
                  onClick={(e) => handleViewLogClick(e as any, contact)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">receipt_long</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

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
