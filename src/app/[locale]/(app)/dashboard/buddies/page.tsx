import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Separator } from '@/components/ui';
import { Container } from '@/components/layout';

const BuddiesFeed = dynamic(() =>
  import('@/components/app').then((mod) => mod.BuddiesFeed)
);
const CreateBuddyPost = dynamic(() =>
  import('@/components/app').then((mod) => mod.CreateBuddyPost)
);
const PeopleYouMayKnow = dynamic(() =>
  import('@/components/app').then((mod) => mod.PeopleYouMayKnow)
);
const InviteFriends = dynamic(() =>
  import('@/components/common').then((mod) => mod.InviteFriends)
);


export const metadata: Metadata = {
  title: 'Buddies',
};

const BuddiesPage = () => {
  return (
    <Container className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
        <div className="md:col-span-2 flex flex-col gap-4">
          <CreateBuddyPost />
          <Separator />
          <BuddiesFeed />
        </div>
        <div className="sticky top-20 hidden md:flex flex-col gap-4 pb-4 h-fit">
          <PeopleYouMayKnow limitTo={9} sm />
          <InviteFriends />
        </div>
      </div>
    </Container>
  );
};

export default BuddiesPage;
