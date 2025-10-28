import React from 'react';
import { Button } from './ui/button';
import { Share } from 'lucide-react';
import { useLaunchParams, shareMessage } from '@tma.js/sdk-react';
import { useAPI } from '~/api/use-api';
import { toast } from "sonner"

interface TelegramLinkButtonProps {
  contactId: number;
  contactName: string;
}

export const TelegramLinkButton: React.FC<TelegramLinkButtonProps> = ({
  contactId,
  contactName,
}) => {
  const { api } = useAPI();

  const handleLinkTelegramUser = async () => {
    try {
      if (!shareMessage.isAvailable) {
        toast('Can\'t share link to activate');
        return
      }

      const response = await api.contacts.contactsControllerPrepareInvite(contactId.toString());


      if (response.status === 200) {
        shareMessage(response.data);
      } else {
        toast('Can\'t get link to invite');
      }

    } catch (error) {
      toast(`Error initializing Telegram linking: ${error}`);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleLinkTelegramUser}
      title={`Link Telegram account for ${contactName}`}
    >
      <Share className="w-4 h-4" />
    </Button>
  );
};