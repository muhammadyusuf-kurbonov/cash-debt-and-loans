import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CurrencySelect } from './currency-select/currency-select';
import CurrencyInput from 'react-currency-input-field';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';
import { ApiClient } from '~/lib/api-client';
import type { ContactResponseDto } from '~/api/api-client';

type Transaction = {
  amount: number;
  description: string;
  cancelled: boolean;
  currencyId: number;
  createdAt: Date;
  contactId?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (newData: Transaction) => void;
  contactId?: number;
};

export function AddTransactionModal({ open, onClose, onAdd, contactId }: Props) {
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<number>(1);
  const [amount, setAmount] = useState(0.0);
  const [type, setType] = useState<'debit' | 'credit'>('credit');
  const [transactionDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>(contactId);

  const api = ApiClient.getOpenAPIClient();

  const { data: contacts = [], isLoading: loadingContacts } = useQuery<ContactResponseDto[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.contacts.contactsControllerFindAll();
      return response?.data || [];
    },
    enabled: !contactId, // Only fetch if contactId is not provided
    staleTime: 5 * 60 * 1000,
  });

  const handleAdd = () => {
    if (currency === undefined) return;
    const finalContactId = contactId ?? selectedContactId;
    if (!finalContactId) return; // Must have a contact selected
    if (amount != 0) {
      const finalAmount = type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
      onAdd({
        amount: finalAmount,
        description,
        cancelled: false,
        currencyId: currency,
        createdAt: new Date(transactionDate),
        contactId: finalContactId,
      });
      setDescription('');
      setAmount(0);
      setType('credit');
      setSelectedContactId(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-lg font-semibold text-center">Новая транзакция</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-28 pt-4">
          {/* Contact Selector - Only shown when contactId prop is not provided */}
          {!contactId && (
            <div className="space-y-2 mb-6">
              <label className="text-[13px] font-medium text-primary uppercase tracking-wider ml-1">Контакт</label>
              <Select
                value={selectedContactId?.toString()}
                onValueChange={(value) => setSelectedContactId(parseInt(value))}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  {loadingContacts ? (
                    <SelectValue placeholder="Загрузка..." />
                  ) : (
                    <SelectValue placeholder="Выберите контакт" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name || `Контакт #${contact.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Segmented Control */}
          <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex mb-6">
            <button
              type="button"
              onClick={() => setType('credit')}
              className={cn(
                'flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all',
                type === 'credit'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-foreground'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Я дал
            </button>
            <button
              type="button"
              onClick={() => setType('debit')}
              className={cn(
                'flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all',
                type === 'debit'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-foreground'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Мне дали
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2 mb-6">
            <label className="text-[13px] font-medium text-primary uppercase tracking-wider ml-1">Сумма</label>
            <div className="flex items-end gap-3 border-b border-gray-200 dark:border-gray-700 focus-within:border-primary transition-colors pb-2">
              <CurrencySelect currency={currency} onChange={(c) => setCurrency(c)} />
              <CurrencyInput
                className="w-full text-4xl font-bold bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder:text-gray-200 dark:placeholder:text-gray-700"
                placeholder="0.00"
                autoComplete="off"
                name="amount"
                id="amount"
                onValueChange={(_, __, values) => setAmount(values?.float ?? 0)}
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-primary uppercase tracking-wider ml-1">Заметка</label>
            <Input
              placeholder="За что?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-0 border-b border-gray-200 dark:border-gray-700 rounded-none px-1 py-3 text-lg focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent">
          <Button
            onClick={handleAdd}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl shadow-lg"
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
