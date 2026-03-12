import React from 'react';

import { Link } from '@/i18n/routing';
import type { Chat } from '@/lib/definitions';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatLinkCardProps {
  className?: string;
  chat: Chat;
  onClick: () => void;
}

const ChatLinkCard: React.FC<ChatLinkCardProps> = ({ chat, onClick }) => {
  return (
    <Button
      className={cn('line-clamp-1 w-full min-h-14 ')}
      variant="ghost"
      onClick={onClick}
      asChild
    >
      <Link href={`/dashboard/ai/chat/${chat.chat_id}`}>
        <div>
          <p>{chat.title || 'New Chat'}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(chat.created), 'd MMM, yyyy hh:mm:ss a')}
          </p>
        </div>
      </Link>
    </Button>
  );
};

export { ChatLinkCard };
