import { z } from 'zod';

import type { ChatRoles } from '@/lib/constants';
import type { AIGolfCourse, ChatMessage } from '@/lib/definitions';

export const chatSchema = z.object({
  query: z.string().trim().min(1, {
    message: 'Type something to get started!',
  }),
});

type BaseMessage = Partial<ChatMessage> & {
  content: string;
  role: (typeof ChatRoles)[keyof typeof ChatRoles];
};

type AssistantMessage = BaseMessage & {
  role: 'assistant';
  courses?: AIGolfCourse[];
};
type UserMessage = BaseMessage & { role: 'user' };

export type ChatResponseMessage = AssistantMessage | UserMessage;

export * from './chat-list-sheet';
export * from './start-chat';
export * from './chat-messages';
export * from './create-message-input';
