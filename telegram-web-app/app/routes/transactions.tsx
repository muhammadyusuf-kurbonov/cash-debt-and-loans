import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Loader2, NotebookText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Money } from "~/components/money";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ApiClient } from "~/lib/api-client";

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId");
  const contactName = searchParams.get("contactName") || "Contact";
  
  const navigate = useNavigate();
  const api = ApiClient.getOpenAPIClient();
  
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

  const formatTransactionDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

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
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="border rounded-lg">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">
                      <Money
                        value={transaction.amount}
                        symbol={transaction.currency.symbol}
                        className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}
                      />
                    </CardTitle>
                    <Badge 
                      variant={transaction.amount >= 0 ? "default" : "secondary"}
                      className={transaction.amount >= 0 ? 'bg-green-600' : 'bg-red-600'}
                    >
                      {transaction.amount >= 0 ? 'Received' : 'Given'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {transaction.note && (
                    <p className="text-sm text-gray-600 mb-2">{transaction.note}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatTransactionDate(transaction.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
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