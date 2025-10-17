import { useRawInitData } from '@telegram-apps/sdk-react';
import { useCallback, useEffect, useMemo, useState } from "react";
import { type ContactResponseDto, type CreateContactDto } from "~/api/api-client";
import { AddTransactionModal } from "~/components/add-transaction-modal";
import { ContactList } from "~/components/contacts-list";
import { Money } from "~/components/money";
import { StickyFooter } from "~/components/sticky-footer";
import TelegramLoginButton from "~/components/telegram-login-button";
import { ApiClient } from '~/lib/api-client';
import { authenticateWithTelegram, isAuthenticated } from "~/lib/telegram-auth";
import type { Route } from "./+types/home";


type Transaction = {
  amount: number;
  description: string;
  cancelled: boolean;
  currencyId: number;
  createdAt: Date;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Qarz.uz - Debt Tracker" },
    { name: "description", content: "Track your debts and loans efficiently" },
  ];
}

export default function Home() {
  const [contacts, setContacts] = useState<ContactResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState<number | null>(null); // For showing transaction modal
  const [isAuthenticatedState, setIsAuthenticated] = useState<boolean>(false);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const initData = useRawInitData();
  
  // Check authentication status on mount and auto-authenticate if in Telegram Web App
  useEffect(() => {
    const checkAuthStatus = async () => {
      // If already authenticated, just update the state
      if (isAuthenticated()) {
        setIsAuthenticated(true);
        return;
      }
      
      // Auto-authenticate if in Telegram Web App
      if (initData) {
        setAuthenticating(true);
        
        try {
          // Authenticate with our backend
          await authenticateWithTelegram(initData);
          
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
  }, [initData]);
  
  // Initialize API client
  const api = ApiClient.getOpenAPIClient();

  async function fetchContacts() {
    try {
      setLoading(true);
      const backendContactsResponse = await api.contacts.contactsControllerFindAll();
      
      const contacts = backendContactsResponse.data;

      setContacts(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // Set token if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setSecurityData(`Bearer ${token}`);
    }
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    
    fetchContacts();
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    // Reload contacts after authentication
    
    fetchContacts();
  }, [api]);

  const handleAddNewContact = useCallback(async (newContact: CreateContactDto) => {
    try {
      // Create the contact in the backend
      const backendResult = await api.contacts.contactsControllerCreate({
        name: newContact.name,
      });
      
      // Add to our local state
      const contactToAdd = backendResult.data;

      const justCreatedContact = await api.contacts.contactsControllerFindOne(contactToAdd.id.toString());
      
      setContacts(prev => [...prev, justCreatedContact.data]);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  }, []);

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
        });
      } else {
        // This is a withdrawal (given money)
        await api.transactions.transactionsControllerWithdraw({
          contact_id: activeContact,
          currency_id: newData.currencyId,
          amount: Math.abs(newData.amount),
        });
      }

      const updatedContact = await api.contacts.contactsControllerFindOne(activeContact.toString());
      
      // Update local state to reflect the transaction
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeContact
            ? updatedContact.data
            : contact
        )
      );
      
      setActiveContact(null);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, [activeContact]);

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
        onNewContactCreate={handleAddNewContact} 
        onContactClick={(contact) => setActiveContact(contact.id)} 
        onContactViewLogClick={(contact) => {
          // In a real app, this would navigate to the contact's transaction log
          console.log("View log for", contact);
        }} 
      />

      <StickyFooter className='max-w-2xl mx-auto'>
        <div className='flex flex-row w-full justify-between items-center gap-2'>
          <span className="text-gray-600 font-semibold">Total Balance:</span>
          <div className="text-right">
            { Object.entries(totalBalances).map(([symbol, value]) => (
              <Money value={value} symbol={symbol} key={symbol} />
            )) }
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