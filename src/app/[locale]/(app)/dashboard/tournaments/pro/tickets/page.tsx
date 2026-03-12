import React from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ProTicketContainer } from '@/components/app/dashboard/tournaments/pro/tournaments/tickets';

const TournamentContainer = dynamic(() =>
  import('@/components/app').then((mod) => mod.TournamentContainer)
);

export const metadata: Metadata = {
  title: 'Pro Leaderboard - Tickets',
};

const ProTournamentsPage = () => {
  return (
    <TournamentContainer>
      <ProTicketContainer />
    </TournamentContainer>
  );
};

export default ProTournamentsPage;
