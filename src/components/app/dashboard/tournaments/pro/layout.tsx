'use client';

import { Container } from '@/components/layout';
import { TopBar } from './parts/top';
import { ProLeaguesList } from './leagues-list';
import type { ProTournamentStatus } from './_interface';
import { useAppSelector } from '@/lib';


export const TournamentLayout = () => {
  const { activeFilters: fil } = useAppSelector(
    (s) => s.leagues
  );


  return (
    <Container className="py-4 space-y-4">
      <TopBar />

      <ProLeaguesList
        year={fil?.params?.year as string}
        status={fil?.status as ProTournamentStatus}
        type={fil?.tournament}
      />
    </Container>
  );
};
