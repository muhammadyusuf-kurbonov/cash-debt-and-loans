import { transactionsTable } from '@/db/schema';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (newData: typeof transactionsTable.$inferInsert) => void;
};

export function AddTransactionModal({ open, onClose, onAdd }: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');

  const handleAdd = () => {
    if (parseFloat(amount.trim()) != 0) {
      setDescription('');
      setAmount('');
      setType('debit');
      onAdd({
        amount: parseFloat(amount) * (type === 'debit' ? -1 : 1),
        description,
        cancelled: false,
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
          <RadioGroup value={type} onValueChange={(value) => setType(value as 'debit' | 'credit')}>
            <div className="flex items-center space-x-4">
              <Label>
                <RadioGroupItem value="debit" /> RECEIVED
              </Label>
              <Label>
                <RadioGroupItem value="credit" /> GIVEN
              </Label>
            </div>
          </RadioGroup>
          <Input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input placeholder="Note" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={handleAdd} disabled={!amount.trim() || parseFloat(amount.trim()) == 0} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
