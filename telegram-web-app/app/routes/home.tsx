import type { Route } from "./+types/home";
import { ContactList } from "~/components/contacts-list";
import { AddTransactionModal } from "~/components/add-transaction-modal";
import { StickyFooter } from "~/components/sticky-footer";
import { Money } from "~/components/money";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Api } from "~/api/api-client";

// Define types for our application
type AppContact = {
  id: number;
  fullName: string;
  balance: number;
  currencySymbol: string;
  currencyId: number;
};

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
  const [contacts, setContacts] = useState<AppContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState<number | null>(null); // For showing transaction modal
  
  // Initialize API client
  const api = new Api({
    baseUrl: 'http://localhost:3001', // Backend URL
  });
  
  // Set token if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setSecurityData(`Bearer ${token}`);
    }
    
    // Load contacts from backend
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const backendContacts = await api.contacts.contactsControllerFindAll();
        
        // Transform backend contacts to our app format
        const appContacts = backendContacts.data.map(contact => ({
          id: contact.id,
          fullName: contact.name || `Contact ${contact.id}`,
          balance: 0, // Backend doesn't return balance directly, need to fetch separately
          currencySymbol: '$', // Default placeholder
          currencyId: 1, // Default placeholder
        }));
        
        setContacts(appContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleAddNewContact = useCallback(async (newContact: Omit<AppContact, 'id'>) => {
    try {
      // Create the contact in the backend
      const backendResult = await api.contacts.contactsControllerCreate({
        name: newContact.fullName,
      });
      
      // Add to our local state
      const contactToAdd = {
        id: backendResult.data.id,
        fullName: newContact.fullName,
        balance: newContact.balance || 0,
        currencySymbol: newContact.currencySymbol || '$',
        currencyId: newContact.currencyId || 1,
      };
      
      setContacts(prev => [...prev, contactToAdd]);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  }, []);

  const handleAddNewTransaction = useCallback(async (newData: Transaction) => {
    try {
      // In a real implementation, this would call the backend API
      // depending on the amount sign, we would call either topup or withdraw
      if (newData.amount > 0) {
        // This is a topup (received money)
        await api.transactions.transactionsControllerTopup({
          contact_id: activeContact || 0,
          currency_id: newData.currencyId,
          amount: newData.amount,
        });
      } else {
        // This is a withdrawal (given money)
        await api.transactions.transactionsControllerWithdraw({
          contact_id: activeContact || 0,
          currency_id: newData.currencyId,
          amount: Math.abs(newData.amount),
        });
      }
      
      // Update local state to reflect the transaction
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeContact
            ? { ...contact, balance: contact.balance + newData.amount }
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
    return contacts.reduce((acc, contact) => {
      if (!acc[contact.currencySymbol]) {
        acc[contact.currencySymbol] = 0
      }
      acc[contact.currencySymbol] += contact.balance;
      return acc;
    }, {} as Record<string, number>);
  }, [contacts]);

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