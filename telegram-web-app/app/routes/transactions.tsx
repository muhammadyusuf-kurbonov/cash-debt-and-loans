import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, NotebookText } from "lucide-react";
import { useMemo, useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Currency, Transaction } from "~/api/api-client";
import { AddTransactionModal } from "~/components/add-transaction-modal";
import { Money } from "~/components/money";
import { StickyFooter } from "~/components/sticky-footer";
import { TransactionsList } from "~/components/transaction-list";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ApiClient } from "~/lib/api-client";
import { TOKEN_STORAGE_KEY } from "~/lib/telegram-auth";

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const contactName = searchParams.get("contactName") || "Contact";
  const [showAddModal, setShowAddModal] = useState(false);

  const navigate = useNavigate();
  const api = ApiClient.getOpenAPIClient();
  const queryClient = useQueryClient();

  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['contact-transactions', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const response = await api.contacts.contactsControllerGetTransactions(contactId, ({ includeDeleted: 'true' } as any));
      return response.data;
    },
    enabled: !!contactId,
  });

  const cancel = useMutation({
    mutationKey: ['cancel-contact-transactions'],
    mutationFn: async (transactionId: Transaction['id']) => {
      const response = await api.transactions.transactionsControllerCancel(transactionId.toString());
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-transactions', contactId],
      });
    }
  })

  const updateNote = useMutation({
    mutationKey: ['update-transaction-note'],
    mutationFn: async ({ transactionId, note }: { transactionId: Transaction['id']; note: string }) => {
      const response = await api.transactions.transactionsControllerUpdate(transactionId.toString(), { note });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-transactions', contactId],
      });
    }
  })

  const totalBalances = useMemo(() => {
    const balances: Record<Currency['symbol'], number> = {};
    transactions?.forEach(transaction => {
      balances[transaction.currency.symbol] = (balances[transaction.currency.symbol] || 0) + transaction.amount;
    });
    return balances;
  }, [transactions]);

  const handleRecalculate = useCallback(async () => {
    if (!contactId) return;

    try {
      await api.contacts.contactsControllerRecalculateBalance(contactId);

      // Refresh transactions and contacts list
      queryClient.invalidateQueries({ queryKey: ['contact-transactions', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    } catch (err) {
      console.error('Error recalculating balances', err);
    }
  }, [contactId, queryClient]);

  const handleAddNewTransaction = useCallback(async (newData: { amount: number; description: string; cancelled: boolean; currencyId: number; createdAt: Date }) => {
    if (!contactId) return;
    try {
      if (newData.amount > 0) {
        await api.transactions.transactionsControllerTopup({
          contact_id: Number(contactId),
          currency_id: newData.currencyId,
          amount: newData.amount,
          note: newData.description,
        });
      } else {
        await api.transactions.transactionsControllerWithdraw({
          contact_id: Number(contactId),
          currency_id: newData.currencyId,
          amount: Math.abs(newData.amount),
          note: newData.description,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['contact-transactions', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, [contactId, api, queryClient]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight truncate">{contactName}</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm" className="flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">add</span>
          Добавить
        </Button>
      </header>

      <main className="flex-1 px-4 py-4">

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка транзакций...</span>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          Ошибка загрузки транзакций
        </div>
      ) : transactions && transactions.length > 0 ? (
        <>
          <ScrollArea className="h-[calc(100vh-200px)] pr-2">
            <div className="space-y-3">
              <TransactionsList 
                transactions={transactions} 
                onDeleteTransaction={cancel.mutate} 
                onEditNote={(id, note) => updateNote.mutate({ transactionId: id, note })} 
              />
            </div>
          </ScrollArea>
          <StickyFooter>
            <div className='w-full flex flex-row justify-between items-center gap-2'>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-semibold">Итого:</span>
                <div className="text-right">
                  {Object.entries(totalBalances).map(([symbol, value]) => (<Money value={value} symbol={symbol} key={symbol} />))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRecalculate}>Пересчитать</Button>
              </div>
            </div>
          </StickyFooter>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <NotebookText className="h-12 w-12 mb-4" />
          <p>Транзакции не найдены</p>
          <p className="text-sm mt-2">Добавьте первую транзакцию</p>
        </div>
      )}
      </main>

      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddNewTransaction}
        contactId={contactId ? Number(contactId) : undefined}
      />
    </div>
  );
}