import React from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Container } from '@/components/layout';
import { PlayerDetails } from '@/components/app/dashboard/tournaments/pro/tournaments/players/details';

const TournamentContainer = dynamic(() =>
  import('@/components/app').then((mod) => mod.TournamentContainer)
);

export const metadata: Metadata = {
  title: 'Pro Leaderboard - Player',
};

const ProPlayerDetailPage = () => {
  return (
    <Container>
      <PlayerDetails />
    </Container>
  );
};

export default ProPlayerDetailPage;
