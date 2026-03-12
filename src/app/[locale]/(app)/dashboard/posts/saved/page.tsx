import React from 'react';
import type { Metadata } from 'next';

import { Container } from '@/components/layout';
import dynamic from 'next/dynamic';

const PeopleYouMayKnow = dynamic(() =>
  import('@/components/app').then((mod) => mod.PeopleYouMayKnow)
);
const ProfileCard = dynamic(() =>
  import('@/components/app').then((mod) => mod.ProfileCard)
);
const SavedPostsFeed = dynamic(() =>
  import('@/components/app').then((mod) => mod.SavedPostsFeed)
);

export const metadata: Metadata = {
  title: 'Saved Posts',
};

const SavedPostsPage = () => {
  return (
    <Container className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
        <div className="md:col-span-2 flex flex-col gap-4">
          <SavedPostsFeed />
        </div>
        <div className="sticky top-20 hidden md:flex flex-col gap-2 pb-4 h-fit">
          <ProfileCard />
          <PeopleYouMayKnow limitTo={8} sm />
        </div>
      </div>
    </Container>
  );
};

export default SavedPostsPage;
