// components/leaderboard/BaseLeaderboard.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { LeaderboardData, LeaderboardItem } from '../../../_interface';

export interface BaseLeaderboardProps {
  data: LeaderboardItem;
  children: React.ReactNode;
  className?: string;
}

export const BaseLeaderboard: React.FC<BaseLeaderboardProps> = ({
  data,
  children,
  className = '',
}) => {
  const format = data.tournament_type;

  const getHeaders = () => {
    switch (format) {
      case 'TEAM_CUP':
        return ['Group', 'United States', 'International', 'Europe', 'Match Status'];
      case 'TEAM_STROKE':
        return [
          'Pos',
          'Team',
          'Total',
          'Thru',
          'Round',
          'R1',
          'R2',
          'R3',
          'R4',
          'Strokes',
          'Proj',
          'Starting',
          '',
        ];
      case 'STABLEFORD':
        return [
          'Pos',
          'Player',
          'Points',
          'R1',
          'R2',
          'R3',
          'R4',
          'Total',
          'Thru',
          '',
        ];
      default: // STROKE_PLAY
        return [
          'Pos',
          'Player',
          'Total',
          'Thru',
          'Round',
          'R1',
          'R2',
          'R3',
          'R4',
          'Strokes',
          '',
        ];
    }
  };

  return (
    <div className={`rounded-lg border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {getHeaders().map((header, index) => {
              // Special styling for Team Cup headers
              const isTeamCup = format === 'TEAM_CUP';
              const isTeamColumn = ['United States', 'International', 'Europe'].includes(header);
              const isGroupColumn = header === 'Group';
              const isStatusColumn = header === 'Match Status';

              return (
                <TableHead
                  key={index}
                  className={`
                    ${header == 'Player' || header == 'Team' ? '' : 'text-center'}
                    ${header === 'Pos' ? 'w-10' : ''}
                    ${isTeamCup && isGroupColumn ? 'w-24 text-center font-semibold' : ''}
                    ${isTeamCup && isStatusColumn ? 'w-40 text-center font-semibold' : ''}
                    ${isTeamCup && isTeamColumn ? 'text-center font-bold text-base' : ''}
                  `}
                >
                  {header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
};
