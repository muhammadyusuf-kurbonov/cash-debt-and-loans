'use client';
import { currencyTable, transactionsTable } from '@/db/schema';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CurrencySelect } from './currency-select/currency-select';
import CurrencyInput from 'react-currency-input-field';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';


type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (newData: typeof transactionsTable.$inferInsert) => void;
};

export function AddTransactionModal({ open, onClose, onAdd }: Props) {
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<typeof currencyTable.$inferSelect['id']>();
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [transactionDate, setTransactionDate] = useState(format(new Date(), 'yyyy-MM-dd\'T\'hh:mm:ss'));

  const handleAdd = () => {
    if (currency === undefined) {
      return;
    }

    if (amount != 0) {
      setDescription('');
      setAmount(0);
      setType('debit');
      onAdd({
        amount: amount * (type === 'debit' ? -1 : 1),
        description,
        cancelled: false,
        currencyId: currency,
        createdAt: parse(transactionDate, 'yyyy-MM-dd\'T\'hh:mm:ss', new Date()),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as 'debit' | 'credit')}
          >
            <div className="flex items-center space-x-4">
              <Label>
                <RadioGroupItem value="debit" /> RECEIVED
              </Label>
              <Label>
                <RadioGroupItem value="credit" /> GIVEN
              </Label>
            </div>
          </RadioGroup>
          <div className='flex flex-row gap-1'>
            <CurrencyInput 
              className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                'flex-grow'
              )}
              placeholder="Amount" value={amount} onValueChange={(value, name, values) => setAmount(values?.float ?? 0)} />
            <CurrencySelect currency={currency} onChange={(currency) => {console.log(currency); setCurrency(currency);}}></CurrencySelect>
          </div>
          <Input placeholder="Note" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="datetime-local" placeholder="Transaction date" value={transactionDate} onChange={(value) => setTransactionDate(value.target.value)} />
          <Button onClick={handleAdd} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
