import React from 'react';
import { Button } from './ui/button';
import { Share } from 'lucide-react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { switchToInlineQuery } from '~/lib/telegram-utils';

interface TelegramLinkButtonProps {
  contactId: number;
  contactName: string;
  onLinkInitiated?: () => void;
  onLinkSuccess?: () => void;
  onLinkError?: (error: Error) => void;
}

export const TelegramLinkButton: React.FC<TelegramLinkButtonProps> = ({
  contactId,
  contactName,
  onLinkInitiated,
  onLinkSuccess,
  onLinkError,
}) => {
  const { platform } = useLaunchParams();

  const handleLinkTelegramUser = () => {
    try {
      // Check if we're in a Telegram Web App environment
      if (platform) {
        // Trigger the switchInlineQuery to allow the user to share with a specific contact
        // The query will contain the contact ID so the bot can link the Telegram user
        const query = `link_contact_${contactId}`;
        
        // Use our utility function to switch to inline query
        const success = switchToInlineQuery(query, ['users']);
        
        if (success) {
          // Notify that the linking process has been initiated
          if (onLinkInitiated) {
            onLinkInitiated();
          }
          
          // Note: The actual linking happens on the backend when the user sends the inline query result
          if (onLinkSuccess) {
            onLinkSuccess();
          }
        } else {
          throw new Error('Failed to initiate inline query');
        }
      } else {
        throw new Error('Not running in Telegram Web App environment');
      }
    } catch (error) {
      console.error('Error initializing Telegram linking:', error);
      if (onLinkError) {
        onLinkError(error as Error);
      }
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