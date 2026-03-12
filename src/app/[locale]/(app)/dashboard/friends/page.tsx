import dynamic from 'next/dynamic';
import React from 'react';

const FriendRequest = dynamic(() =>
  import('@/components/app').then((mod) => mod.FriendRequest)
);
const PeopleYouMayKnow = dynamic(() =>
  import('@/components/app').then((mod) => mod.PeopleYouMayKnow)
);

const FriendsPage = () => {
  return (
    <>
      <FriendRequest />
      <PeopleYouMayKnow />
    </>
  );
};

export default FriendsPage;
