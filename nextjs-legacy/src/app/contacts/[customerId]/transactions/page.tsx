import { getTransactions } from '@/app/actions';
import { TransactionsPageContent } from './content';

export default async function CustomerTransactionsPage({
  params,
}: {
  params: Promise<{
    customerId: string;
  }>;
}) {
  const customerId = parseInt((await params).customerId);
  const transactions = await getTransactions(customerId);

  return (
    <TransactionsPageContent transactions={transactions} contactId={customerId} />
  );
}
