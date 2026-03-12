'use client';
import { ProTournamentType } from '../../_interface';
import { TopBar } from '../../parts/top';
import { ProTicketList } from './list';
import { Container } from '@/components/layout';
import { useAppSelector } from '@/lib';

export function ProTicketContainer() {

  const { activeFilters: filter } = useAppSelector(s => s.leagues)

  return (
    <Container className="space-y-4 py-4">
      <TopBar />
      <ProTicketList type={filter?.tournament as ProTournamentType} />
    </Container>
  );
}
