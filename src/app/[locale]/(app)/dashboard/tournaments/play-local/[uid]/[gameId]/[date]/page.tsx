import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const GameDetailLayout = dynamic(() =>
  import('@/components/app/dashboard/tournaments/play-local/view/layout').then(
    (mod) => mod.default
  )
);

export const metadata: Metadata = {
  title: 'Tournament Detail',
};


const TournamentDetail = () => {
  return <GameDetailLayout />;
};

export default TournamentDetail;
