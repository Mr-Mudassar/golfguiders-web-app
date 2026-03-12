import React from 'react';
import Link from 'next/link';
import { Button, Icon } from '@/components/ui';
import { Container } from '@/components/layout';
import { ChatListSheet } from '@/components/app';

const ChatLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Container className="py-4 ">
      <main className="relative">
        <div className="absolute top-0 flex gap-1 w-fit z-10">
          <ChatListSheet />
          <Button size="icon" variant="ghost" asChild>
            <Link href="/dashboard/ai/chat" prefetch={false}>
              <Icon name="write" size={20} className="text-muted-foreground" />
            </Link>
          </Button>
        </div>
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </Container>
  );
};

export default ChatLayout;
