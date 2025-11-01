import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRawInitData, viewport } from '@tma.js/sdk-react';
import { useCallback, useEffect, useMemo, useState } from "react";
import { type CreateContactDto, type UpdateContactDto } from "~/api/api-client";
import { AddTransactionModal } from "~/components/add-transaction-modal";
import { ContactList } from "~/components/contacts-list";
import { Money } from "~/components/money";
import { StickyFooter } from "~/components/sticky-footer";
import TelegramLoginButton from "~/components/telegram-login-button";
import { ApiClient } from '~/lib/api-client';
import { authenticateWithTelegram, isAuthenticated } from "~/lib/telegram-auth";
import type { Route } from "./+types/home";
import { max } from 'date-fns';


type Transaction = {
  amount: number;
  description: string;
  cancelled: boolean;
  currencyId: number;
  createdAt: Date;
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Qarz.uz - Debt Tracker" },
    { name: "description", content: "Track your debts and loans efficiently" },
  ];
}

export default function Home() {
  const [activeContact, setActiveContact] = useState<number | null>(null); // For showing transaction modal
  const [isAuthenticatedState, setIsAuthenticated] = useState<boolean>(false);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const initDataRaw = useRawInitData();

  // Check authentication status on mount and auto-authenticate if in Telegram Web App
  useEffect(() => {
    const checkAuthStatus = async () => {
      // If already authenticated, just update the state
      if (isAuthenticated()) {
        setIsAuthenticated(true);
        return;
      }

      // Auto-authenticate if in Telegram Web App
      if (initDataRaw) {
        setAuthenticating(true);

        try {
          // Authenticate with our backend
          await authenticateWithTelegram(initDataRaw);

          // Update authentication state
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auto-authentication failed:', error);
          // Still show login button if auto-auth fails
        } finally {
          setAuthenticating(false);
        }
      }
    };

    checkAuthStatus();
  }, [initDataRaw]);

  useEffect(() => {
    viewport.requestFullscreen().then(() => viewport.expand());
  }, []);

  // Initialize API client
  const api = ApiClient.getOpenAPIClient();
  const queryClient = useQueryClient();
  const { data: contacts, isLoading: loading, refetch: fetchContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const backendContactsResponse = await api.contacts.contactsControllerFindAll();

      return backendContactsResponse.data.sort((contact1, contact2) => {
        let firstCustomerLastBalanceUpdate = max(contact1.Balance.map((balance) => balance.updatedAt)).getTime();
        if (!contact1.Balance.length) {
          firstCustomerLastBalanceUpdate = contact1.id;
        }
        let secondContactLastBalanceUpdate = max(contact2.Balance.map((balance) => balance.updatedAt)).getTime();
        if (!contact2.Balance.length) {
          secondContactLastBalanceUpdate = contact2.id;
        }
        return -firstCustomerLastBalanceUpdate + secondContactLastBalanceUpdate;
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

  // Set token if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setSecurityData(`Bearer ${token}`);
    }
    if (!isAuthenticated()) {
      return;
    }

    fetchContacts();
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    // Reload contacts after authentication

    fetchContacts();
  }, [api]);

  const handleAddNewTransaction = useCallback(async (newData: Transaction) => {
    if (!activeContact) {
      return;
    }
    try {
      // In a real implementation, this would call the backend API
      // depending on the amount sign, we would call either topup or withdraw
      if (newData.amount > 0) {
        // This is a topup (received money)
        await api.transactions.transactionsControllerTopup({
          contact_id: activeContact,
          currency_id: newData.currencyId,
          amount: newData.amount,
          note: newData.description,
        });
      } else {
        // This is a withdrawal (given money)
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
      await api.contacts.contactsControllerUpdate(
        id.toString(),
        updatedContact
      );

      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  }, []);

  // Calculate total balances
  const totalBalances = useMemo<Record<string, number>>(() => {
    return contacts.flatMap((contact) => contact.Balance).reduce((acc, balance) => {
      if (!acc[balance.currency.symbol]) {
        acc[balance.currency.symbol] = 0
      }
      acc[balance.currency.symbol] += balance.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [contacts]);

  // Show login button if not authenticated
  if (!isAuthenticatedState) {
    // Show loading indicator if auto-authenticating
    if (authenticating) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return <TelegramLoginButton onAuthSuccess={handleAuthSuccess} />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <ContactList
        contacts={contacts}
        onNewContactCreate={saveNewContact.mutate}
        onContactClick={(contact) => setActiveContact(contact.id)}
        onContactEdit={handleEditContact}
      />

      <StickyFooter className='max-w-2xl mx-auto'>
        <div className='flex flex-row w-full justify-between items-center gap-2'>
          <span className="text-gray-600 font-semibold">Total Balance:</span>
          <div className="text-right">
            {Object.entries(totalBalances).map(([symbol, value]) => (
              <Money value={value} symbol={symbol} key={symbol} />
            ))}
          </div>
        </div>
      </StickyFooter>

      <AddTransactionModal
        open={activeContact != null}
        onClose={() => setActiveContact(null)}
        onAdd={handleAddNewTransaction}
      />
    </>
  );
}