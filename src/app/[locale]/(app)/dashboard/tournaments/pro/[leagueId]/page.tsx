import React from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { TournamentLayout } from '@/components/app/dashboard/tournaments/pro/layout';
// import { ProTournamentDetails } from '@/components/app/dashboard/tournaments/pro/tournaments/details';
import { ProTournaments } from '@/components/app';
import { Container } from '@/components/layout';

const TournamentContainer = dynamic(() =>
  import('@/components/app').then((mod) => mod.TournamentContainer)
);

export const metadata: Metadata = {
  title: 'Pro Leaderboard',
};

const ProTournamentsPage = () => {
  return (
    <TournamentContainer>
      <Container>
        <ProTournaments />
      </Container>
    </TournamentContainer>
  );
};

export default ProTournamentsPage;
