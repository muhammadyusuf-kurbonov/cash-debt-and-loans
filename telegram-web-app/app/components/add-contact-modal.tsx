import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import type { Contact } from '~/api/api-client';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (newContact: Omit<Contact, 'user_id' | 'id'>) => void;
};

export function AddContactButton({ open, onClose, onAdd }: Props) {
  const [fullName, setFullName] = useState('');

  const handleAdd = () => {
    if (fullName.trim()) {
      onAdd({
        name: fullName,
      });
      setFullName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый контакт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Имя" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Button onClick={handleAdd} className="w-full">Добавить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}