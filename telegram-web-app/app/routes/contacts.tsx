import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { init, viewport } from '@tma.js/sdk-react';
import { max } from 'date-fns';
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { type CreateContactDto, type UpdateContactDto } from "~/api/api-client";
import { AddTransactionModal } from "~/components/add-transaction-modal";
import { ContactList } from "~/components/contacts-list";
import { ApiClient } from '~/lib/api-client';
import { isAuthenticated } from "~/lib/telegram-auth";
import { useTelegramData } from "~/lib/useTelegramData";

export function meta() {
  return [
    { title: "Contacts - Qarz.uz" },
    { name: "description", content: "Manage your contacts" },
  ];
}

export default function Contacts() {
  const [activeContact, setActiveContact] = useState<number | null>(null);
  const { isTelegram } = useTelegramData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (!isTelegram) return;
    init();
    if (viewport.requestFullscreen.isAvailable()) {
      viewport.requestFullscreen().then(() => viewport.expand());
    }
  }, []);

  const api = ApiClient.getOpenAPIClient();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading: loading, refetch: fetchContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.contacts.contactsControllerFindAll();
      return response.data.sort((a, b) => {
        let aTime = a.Balance.length ? max(a.Balance.map(bal => bal.updatedAt)).getTime() : a.id * 1000000000;
        let bTime = b.Balance.length ? max(b.Balance.map(bal => bal.updatedAt)).getTime() : b.id * 1000000000;
        return -aTime + bTime;
      });
    },
    initialData: [],
  });

  const saveNewContact = useMutation({
    mutationKey: ['new_contact'],
    mutationFn: async (newContact: CreateContactDto) => {
      return await api.contacts.contactsControllerCreate(newContact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      api.setSecurityData(`Bearer ${token}`);
    }
    if (isAuthenticated()) {
      fetchContacts();
    }
  }, []);

  const handleAddNewTransaction = useCallback(async (newData: { amount: number; description: string; cancelled: boolean; currencyId: number; createdAt: Date }) => {
    if (!activeContact) return;
    try {
      if (newData.amount > 0) {
        await api.transactions.transactionsControllerTopup({
          contact_id: activeContact,
          currency_id: newData.currencyId,
          amount: newData.amount,
          note: newData.description,
        });
      } else {
        await api.transactions.transactionsControllerWithdraw({
          contact_id: activeContact,
          currency_id: newData.currencyId,
          amount: Math.abs(newData.amount),
          note: newData.description,
        });
      }
      fetchContacts();
      setActiveContact(null);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, [activeContact]);

  const handleEditContact = useCallback(async (id: number, updatedContact: UpdateContactDto) => {
    try {
      await api.contacts.contactsControllerUpdate(id.toString(), updatedContact);
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  }, []);

  return (
    <>
      <ContactList
        contacts={contacts}
        loading={loading}
        onNewContactCreate={saveNewContact.mutate}
        onContactClick={(contact) => setActiveContact(contact.id)}
        onContactEdit={handleEditContact}
      />

      <AddTransactionModal
        open={activeContact != null}
        onClose={() => setActiveContact(null)}
        onAdd={handleAddNewTransaction}
      />
    </>
  );
}
