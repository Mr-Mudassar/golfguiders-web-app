'use client';

import {
  Icon,
  Sheet,
  Button,
  Skeleton,
  ScrollArea,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetTrigger,
} from '@/components/ui';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAppSelector } from '@/lib';
import type { RootState } from '@/lib/redux';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

const ChatLinkCard = dynamic(() =>
  import('./chat-card').then((mod) => mod.ChatLinkCard)
);

interface ChatListSheetProps {
  className?: string;
}

interface ChatListTypes {
  title: string;
  chat_id: string;
  user_id: string;
  created: string;
}

const ChatListSheet: React.FC<ChatListSheetProps> = ({ className }) => {
  const [open, setOpen] = React.useState(false);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [chatListLoading, setChatListLoading] = React.useState(false);
  const [allChatLists, setAllChatLists] = React.useState<ChatListTypes[]>([]);
  const hasFetchedRef = React.useRef(false);
  const isFetchingRef = React.useRef(false);

  const fetchAllChatsHistory = React.useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingRef.current || !user?.userid) return;

    isFetchingRef.current = true;
    setChatListLoading(true);
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.GOLFERGPT_X_API_KEY!,
    };

    const body = {
      user_id: user.userid,
    };

    try {
      const response = await fetch(
        `${process.env.GOLFGUIDERS_GPT_URL}/chat/all`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      // console.log('✅ chat list response:', data);
      setAllChatLists(data);
      hasFetchedRef.current = true;
    } catch (error) {
      toast.error('Failed to fetch chat list');
      console.error('Error fetching chat list:', error);
    } finally {
      setChatListLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.userid]);

  useEffect(() => {
    // Only fetch once and only if user is available
    if (!hasFetchedRef.current && user?.userid) {
      fetchAllChatsHistory();
    }
  }, [user?.userid, fetchAllChatsHistory]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button className={className} size="icon" variant="ghost">
          <Icon name="sheet-left-open" className="w-5 h-5 text-gray-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-4/5 md:w-3/4 z-99999999!">
        <SheetHeader className="flex items-center flex-row justify-between mt-4">
          <SheetTitle>Chats</SheetTitle>
          <Button size="icon" variant="ghost" asChild>
            <Link href="/dashboard/ai/chat">
              <Icon className="text-gray-500" name="write" size={20} />
            </Link>
          </Button>
        </SheetHeader>

        <ScrollArea className={'h-[80dvh]'}>
          {chatListLoading ? (
            <div className="flex gap-1 flex-col">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-8" />
              ))}
            </div>
          ) : allChatLists?.length === 0 ? (
            <div className="flex items-center justify-center text-center h-40">
              <p>No chat yets? Start a new chat now!</p>
            </div>
          ) : (
            allChatLists?.map((chat) => (
              <ChatLinkCard
                chat={chat}
                key={chat?.chat_id}
                onClick={() => setOpen(false)}
              />
            ))
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export { ChatListSheet };
