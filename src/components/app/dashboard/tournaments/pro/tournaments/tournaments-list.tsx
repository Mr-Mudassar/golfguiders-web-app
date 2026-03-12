'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Loading } from '@/components/common';
import { Input, ScrollArea } from '@/components/ui';
import { getTournamentStagesByYearGroup } from './_query';
import { useSearchParams } from 'next/navigation';
import { TournamentCard } from '../../tournament-card';
import { useDebounceValue } from 'usehooks-ts';

const TournamentsList = ({ }) => {
  const searchParams = useSearchParams();

  const [search, setSearch] = useDebounceValue('', 500);

  const yearGroupId = searchParams.get('yearId');

  const tournamentStagesQuery = useQuery({
    queryKey: ['tournamentStagesByYearGroup', yearGroupId],
    queryFn: () => getTournamentStagesByYearGroup({ yearGroupId }),
    enabled: yearGroupId !== null,
  });

  // const filteredTournamentStages = React.useMemo(() => {
  //   if (!search) {
  //     return tournamentStagesQuery.data;
  //   }
  //   return tournamentStagesQuery.data?.filter((stage) =>
  //     stage.name.toLowerCase().includes(search.toLowerCase())
  //   );
  // }, [search, tournamentStagesQuery.data]);

  return (
    <div className="mt-2">
      <Input
        className="mb-1"
        placeholder="Search by tournament title"
        onChange={(e) => setSearch(e.target.value)}
      />
      <ScrollArea className="h-[68vh]">
        {tournamentStagesQuery.isLoading ||
          tournamentStagesQuery.error ||
          !tournamentStagesQuery.data ? (
          <div className="flex items-center justify-center min-h-50 text-center">
            {tournamentStagesQuery.isLoading ? (
              <Loading />
            ) : (
              tournamentStagesQuery.error?.message || 'No records found!'
            )}
          </div>
        ) : (
          'No Tournament'
          // filteredTournamentStages?.map((stage) => (
          //   <TournamentCard key={stage.id} tournamentStage={stage} />
          // ))
        )}
      </ScrollArea>
    </div>
  );
};

export { TournamentsList };
