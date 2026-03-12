import React from 'react';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';

const Markdown = dynamic(() => import('react-markdown'));

import { ChatRoles } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ChatResponseMessage } from '..';

interface AIMessageProps {
  className?: string;
  message: ChatResponseMessage;
}

const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  return (
    <div
      className={cn('w-fit py-2 md:px-3', {
        'bg-primary/40 text-white ml-auto rounded-xl border borde-border max-w-[90%] md:max-w-[75%] px-3':
          message.role === ChatRoles.User,
      })}
    >
      <div className="prose flex flex-col items-start gap-3">
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
      </div>
    </div>
  );
};

export { AIMessage };
