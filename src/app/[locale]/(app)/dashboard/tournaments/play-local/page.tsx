import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Container } from '@/components/layout';

const TournamentsFeed = dynamic(() =>
  import('@/components/app/dashboard/tournaments/play-local').then(
    (mod) => mod.TournamentFeeds
  )
);


export const metadata: Metadata = {
  title: 'Play Tournament',
};

const TournamentPage = () => {
  return (
    <Container className="py-4">
      <TournamentsFeed />
    </Container>
  );
};

export default TournamentPage;
