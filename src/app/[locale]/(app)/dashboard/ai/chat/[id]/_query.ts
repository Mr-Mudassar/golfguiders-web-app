import type { ChatMessage } from '@/lib/definitions';

const BaseUrl = process.env.GOLFGUIDERS_GPT_URL;

export async function getChatMessages({ chatId }: { chatId: string }) {
  const res = await fetch(`${BaseUrl}/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.GOLFERGPT_X_API_KEY!,
    },
    body: JSON.stringify({ chat_id: chatId }),
  });

  if (!res.ok) {
    throw new Error('No messages found!');
  }

  const data: ChatMessage[] = await res.json();

  if (!data) {
    throw new Error('No messages found!');
  }

  return data;
}
