import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, NotebookText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import type { Transaction } from "~/api/api-client";
import { TransactionsList } from "~/components/transaction-list";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ApiClient } from "~/lib/api-client";

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const contactName = searchParams.get("contactName") || "Contact";
  
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
      const response = await api.contacts.contactsControllerGetTransactions(contactId);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <NotebookText className="w-5 h-5" />
        {contactName}'s Transactions
      </h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          Error loading transactions
        </div>
      ) : transactions && transactions.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-200px)] pr-2">
          <div className="space-y-3">
            <TransactionsList transactions={transactions} onDeleteTransaction={cancel.mutate} />
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <NotebookText className="h-12 w-12 mb-4" />
          <p>No transactions found</p>
          <p className="text-sm mt-2">Add your first transaction to see it here</p>
        </div>
      )}
    </div>
  );
}