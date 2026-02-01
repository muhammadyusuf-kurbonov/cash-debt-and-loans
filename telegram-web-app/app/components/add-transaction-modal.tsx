import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { CurrencySelect } from './currency-select/currency-select';
import CurrencyInput from 'react-currency-input-field';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';

type Transaction = {
  amount: number;
  description: string;
  cancelled: boolean;
  currencyId: number;
  createdAt: Date;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (newData: Transaction) => void;
};

export function AddTransactionModal({ open, onClose, onAdd }: Props) {
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<number>(1);
  const [amount, setAmount] = useState(0.0);
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [transactionDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  const handleAdd = () => {
    if (currency === undefined) return;
    if (amount != 0) {
      const finalAmount = type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
      onAdd({
        amount: finalAmount,
        description,
        cancelled: false,
        currencyId: currency,
        createdAt: new Date(transactionDate),
      });
      setDescription('');
      setAmount(0);
      setType('debit');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-lg font-semibold text-center">New Transaction</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-28 pt-4">
          {/* Segmented Control */}
          <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex mb-6">
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
              I owe
            </button>
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
              Owed to me
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2 mb-6">
            <label className="text-[13px] font-medium text-primary uppercase tracking-wider ml-1">How much</label>
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
            <label className="text-[13px] font-medium text-primary uppercase tracking-wider ml-1">Note</label>
            <Input
              placeholder="What is this for?"
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
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
