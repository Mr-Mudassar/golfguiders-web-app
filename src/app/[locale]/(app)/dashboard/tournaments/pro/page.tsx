import React from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { TournamentLayout } from '@/components/app/dashboard/tournaments/pro/layout';

const TournamentContainer = dynamic(() =>
  import('@/components/app').then((mod) => mod.TournamentContainer)
);

export const metadata: Metadata = {
  title: 'Pro Leaderboards',
};

const ProTournamentsPage = () => {
  return (
    <TournamentContainer>
      <TournamentLayout />
    </TournamentContainer>
  );
};

export default ProTournamentsPage;
