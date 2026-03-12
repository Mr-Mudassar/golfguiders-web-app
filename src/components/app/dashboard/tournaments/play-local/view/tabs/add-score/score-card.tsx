'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  CourseScoreCard,
  ScoringMethod,
  TournamentScore,
} from '@/lib/definitions';
import { useGameScore } from '@/lib/hooks/use-tournament/use-game-score';
import { useEffect, useState } from 'react';
import { getSymbol } from '../leaderboard/expand-card';

export function ScoreCard({
  scoreCard: sc,
  isMen,
  hole,
  d,
}: {
  hole: number;
  isMen: boolean;
  scoreCard: CourseScoreCard;
  d: { pId: string; gId: string; round: number; method: ScoringMethod };
}) {
  // console.log('scores', d);
  // const [score, setScore] = useState(Array.from({ length: 18 }, () => 0));

  const { gameScore } = useGameScore({
    gameId: d?.gId,
    method: d?.method,
    playerId: d?.pId,
    round: d?.round,
  });
  const [ps, setPS] = useState<TournamentScore>();

  useEffect(() => {
    const curr = gameScore?.find((f) => f.hole === hole);
    setPS(curr);
  }, [hole]);

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Hole Info</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Hole</TableHead>
              <TableHead className="text-center">Par</TableHead>
              <TableHead className="text-center" title="Stroke Index">
                S.I
              </TableHead>
              <TableHead className="text-center">Gross</TableHead>
              <TableHead className="text-center">Net</TableHead>
              <TableHead className="text-center">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-center">
                #{hole == 0 ? 1 : hole}
              </TableCell>
              <TableCell className="text-center">
                {isMen
                  ? sc?.men_par_hole[hole - 1]
                  : sc?.wmn_par_hole[hole - 1]}
              </TableCell>
              <TableCell className="text-center">
                {isMen
                  ? sc?.men_hcp_hole[hole - 1]
                  : sc?.wmn_hcp_hole[hole - 1]}
              </TableCell>
              <TableCell className="text-center relative">
                {getSymbol(ps?.gross_score, ps?.par)}
                <span className="relative z-10">{ps?.gross_score ?? '-'}</span>
              </TableCell>
              <TableCell className="text-center">
                {ps?.net_score || '-'}
              </TableCell>
              <TableCell className="text-center">
                {ps?.net_points || '-'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
