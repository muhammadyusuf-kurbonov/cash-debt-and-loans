import { contactTable } from '@/db/schema';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (newContact: typeof contactTable.$inferInsert & { balance: number }) => void;
};

export function AddContactButton({ open, onClose, onAdd }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState('');
    
  const handleAdd = () => {
    if (fullName.trim() && balance.trim()) {
      onAdd({
        fullName,
        email,
        phone,
        balance: parseFloat(balance),
        deleted: false,
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setBalance('');
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Initial balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
          <Button onClick={handleAdd} className="w-full">Add Contact</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
  