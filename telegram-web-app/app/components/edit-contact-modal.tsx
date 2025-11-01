import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import type { Contact, UpdateContactDto } from '~/api/api-client';

type Props = {
  open: boolean;
  onClose: () => void;
  contactToEdit: Contact | null;
  onEdit: (id: number, updatedContact: UpdateContactDto) => void;
};

export function EditContactModal({ open, onClose, contactToEdit, onEdit }: Props) {
  const [fullName, setFullName] = useState(contactToEdit?.name || '');

  useEffect(() => {
    setFullName(contactToEdit?.name || '');
  }, [contactToEdit]);

  const handleEdit = () => {
    if (fullName.trim() && contactToEdit) {
      onEdit(contactToEdit.id, {
        name: fullName,
      });
      setFullName('');
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Full Name" 
            value={fullName} 
            onChange={handleInputChange} 
          />
          <Button onClick={handleEdit} className="w-full">Update Contact</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}