'use client';

import React, { useEffect, use } from 'react';
import dynamic from 'next/dynamic';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui';
import { ChatRoles } from '@/lib/constants';
import type { ChatResponseMessage } from '@/components/app';

const CreateMessageInput = dynamic(() =>
  import('@/components/app').then((mod) => mod.CreateMessageInput)
);
const ChatMessages = dynamic(() =>
  import('@/components/app').then((mod) => mod.ChatMessages)
);
const NotFound = dynamic(() =>
  import('@/components/common').then((mod) => mod.NotFound)
);

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

const ChatPage: React.FC<ChatPageProps> = ({ params }) => {
  const { id } = use(params);
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatResponseMessage[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetchPreviousMessages = async () => {
    setIsGeneratingResponse(true);
    setError(null);

    // Validate environment variables
    if (!process.env.GOLFERGPT_X_API_KEY) {
      const errorMsg = 'API key is missing';
      console.error(errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      setIsGeneratingResponse(false);
      return;
    }
    if (!process.env.GOLFGUIDERS_GPT_URL) {
      const errorMsg = 'API base URL is missing';
      console.error(errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      setIsGeneratingResponse(false);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.GOLFERGPT_X_API_KEY,
    };

    const body = {
      chat_id: id,
      // user_id: user?.userid,
    };

    try {
      const response = await fetch(
        `${process.env.GOLFGUIDERS_GPT_URL}/chat/messages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
        console.error(errorMsg);
        throw new Error(
          response.status === 404 ? 'Conversation not found' : errorMsg
        );
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.warn('Expected an array of messages, received:', data);
        setMessages([]);
      } else {
        setMessages(data);
      }
    } catch (error) {
      const errorMsg = 'Failed to load previous conversation';
      console.error('Error fetching previous messages:', error);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  useEffect(() => {
    fetchPreviousMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleNewMessage = React.useCallback((message: ChatResponseMessage) => {
    setMessages((prevMessages) => {
      if (
        prevMessages.length > 0 &&
        prevMessages[prevMessages.length - 1].role === ChatRoles.Assistant &&
        message.role === ChatRoles.Assistant
      ) {
        return [
          ...prevMessages.slice(0, -1),
          {
            ...prevMessages[prevMessages.length - 1],
            content: message.content,
          },
        ];
      }
      return [...prevMessages, message];
    });
  }, []);

  return (
    <section className="relative h-[calc(100vh-100px)]">
      {isGeneratingResponse ? (
        <div className="flex flex-col lg:max-w-[80%] mx-auto w-full gap-4">
          <Skeleton className="ml-auto w-48 h-12 rounded-full" />
          <Skeleton className="w-64 h-14 rounded-full" />
          <Skeleton className="ml-auto w-48 h-12 rounded-full" />
          <Skeleton className="w-64 h-14 rounded-full" />
        </div>
      ) : error ? (
        <NotFound
          errorDescription={`Unable to load conversation ${id}`}
        />
      ) : (
        <>
          <ChatMessages
            error={error}
            messages={messages}
            isGenerating={loading}
          />
          <CreateMessageInput
            chatId={id}
            setError={setError}
            onMessageCreate={handleNewMessage}
            setIsGeneratingResponse={setLoading}
          />
        </>
      )}
    </section>
  );
};

export default ChatPage;
