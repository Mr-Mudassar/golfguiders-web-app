// components/leaderboard/formats/StablefordLeaderboard.tsx
import React, { useState } from 'react';
import { TableRow, TableCell, Badge } from '@/components/ui';
import { ReactCountryFlag } from 'react-country-flag';
import { alpha3ToAlpha2 } from '@/lib/utils';
import { Icon } from '@/components/ui';
import { Medal } from 'lucide-react';
import { StrokePlayEntry } from '../../../_interface';
import { ScoreCard } from '../../score-card';

interface StablefordLeaderboardProps {
  players: StrokePlayEntry[];
}

export const StablefordLeaderboard: React.FC<StablefordLeaderboardProps> = ({
  players,
}) => {
  const [activeScoreCard, setActiveScoreCard] = useState<string | null>(null);

  return (
    <>
      {players.map((player) => {
        const isActive = activeScoreCard === player.player_id;
        const isLeader = player.position === '1';

        return (
          <React.Fragment key={player.player_id}>
            <TableRow
              className={`cursor-pointer hover:bg-muted/50 ${isActive ? 'bg-secondary' : ''} ${isLeader ? 'bg-amber-50' : ''}`}
              onClick={() =>
                setActiveScoreCard(isActive ? null : player.player_id)
              }
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {isLeader && <Medal className="w-4 h-4 text-amber-500" />}
                  <Badge variant={isLeader ? 'default' : 'secondary'}>
                    {player.position}
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {player.country_flag && (
                    <ReactCountryFlag
                      svg
                      countryCode={alpha3ToAlpha2(player.country_flag) || ''}
                      className="w-5 h-5"
                    />
                  )}
                  <span>{[player.first_name, player.last_name].filter(Boolean).join(' ').trim()}</span>
                </div>
              </TableCell>

              <TableCell className="text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg">+{player.total}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </TableCell>

              <TableCell className="text-center">+{player.r1 ?? '-'}</TableCell>
              <TableCell className="text-center">+{player.r2 ?? '-'}</TableCell>
              <TableCell className="text-center">+{player.r3 ?? '-'}</TableCell>
              <TableCell className="text-center">+{player.r4 ?? '-'}</TableCell>

              <TableCell className="text-center font-bold">
                +{player.total}
              </TableCell>

              <TableCell className="text-center">
                <Badge variant="outline">{player.thru || '-'}</Badge>
              </TableCell>

              <TableCell>
                <Icon
                  className={`transition-transform ${isActive ? 'rotate-180' : ''}`}
                  name="chevron-down"
                  size={14}
                />
              </TableCell>
            </TableRow>

            {isActive && (
              <TableRow>
                <TableCell colSpan={10} className="p-0">
                  <ScoreCard
                    player={{
                      id: player.player_id,
                      name: [player.first_name, player.last_name].filter(Boolean).join(' ').trim(),
                    }}
                  />
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
