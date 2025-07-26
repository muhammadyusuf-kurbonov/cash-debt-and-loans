import { getContact } from '@/app/actions';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'next-transition-router';

export default async function TransactionsListLayout({children, params}: { children: React.ReactNode, params: Promise<{ customerId: string }> }) {
  const contact = await getContact(parseInt((await params).customerId));
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex row space-x-0.5 items-center">
          <Link href="/">
            <ArrowLeft height={20} />
          </Link>
          <h1 className="text-xl font-bold">Transactions of {contact.fullName}</h1>
        </div>

        <div id="topbar-button"></div>
      </div>
      
      {children}
    </div>
  )
}
