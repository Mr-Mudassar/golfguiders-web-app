// components/leaderboard/formats/StrokePlayLeaderboard.tsx
import React, { useState } from 'react';
import { TableRow, TableCell, Badge } from '@/components/ui';
import { ReactCountryFlag } from 'react-country-flag';
import { alpha3ToAlpha2 } from '@/lib/utils';
import { Icon } from '@/components/ui';
import { StrokePlayEntry } from '../../../_interface';
import { ScoreCard } from '../../score-card';

interface StrokePlayLeaderboardProps {
  players: StrokePlayEntry[];
  onPlayerClick?: (playerId: string) => void;
}

export const StrokePlayLeaderboard: React.FC<StrokePlayLeaderboardProps> = ({
  players,
}) => {
  const [activeScoreCard, setActiveScoreCard] = useState<string | null>(null);

  // Get position badge styling for top 3
  const getPositionBadgeClass = (position: string) => {
    if (position === '1') {
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-2 ring-yellow-300 shadow-lg font-extrabold border-0';
    }
    if (position === '2' || position === 'T2') {
      return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 ring-2 ring-gray-300 shadow-md font-bold border-0';
    }
    if (position === '3' || position === 'T3') {
      return 'bg-gradient-to-br from-orange-300 to-orange-500 text-white ring-2 ring-orange-300 shadow-md font-bold border-0';
    }
    return ''; // default variant for others
  };

  // Get row background gradient for top 3 leaders
  const getRowBackgroundClass = (position: string) => {
    if (position === '1') {
      return 'bg-gradient-to-r from-yellow-50/60 via-yellow-50/20 to-transparent';
    }
    if (position === '2' || position === 'T2') {
      return 'bg-gradient-to-r from-gray-100/60 via-gray-50/20 to-transparent';
    }
    if (position === '3' || position === 'T3') {
      return 'bg-gradient-to-r from-orange-50/60 via-orange-50/20 to-transparent';
    }
    return '';
  };

  // Check if player is currently playing (live)
  const isLivePlaying = (thru?: string) => {
    if (!thru) return false;
    // F, F*, F** etc. are all "finished" states
    if (thru.startsWith('F')) return false;
    return thru !== '-' && thru !== '0';
  };

  // Get color styling for round scores
  const getRoundScoreClass = (score: number | string | undefined) => {
    if (score === undefined || score === null) return 'text-muted-foreground';
    return 'font-medium';
  };

  return (
    <>
      {players.map((player) => {
        const isActive = activeScoreCard === player.player_id;
        const totalStr = player.to_par || player.total;
        const totalScore = Number(totalStr);
        const isLive = isLivePlaying(player.thru);

        return (
          <React.Fragment key={player.player_id}>
            <TableRow
              className={`cursor-pointer transition-all duration-200 hover:bg-muted/60 hover:shadow-sm ${
                isActive
                  ? 'bg-muted/40 border-l-[6px] border-primary shadow-md'
                  : 'border-l-[6px] border-transparent'
              } ${getRowBackgroundClass(player.position)}`}
              onClick={() =>
                setActiveScoreCard(isActive ? null : player.player_id)
              }
            >
              {/* Position Badge */}
              <TableCell>
                <Badge
                  variant={getPositionBadgeClass(player.position) ? undefined : 'secondary'}
                  className={getPositionBadgeClass(player.position)}
                >
                  {player.position}
                </Badge>
              </TableCell>

              {/* Player Name with Flag */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {player.country_flag && (
                    <ReactCountryFlag
                      svg
                      countryCode={alpha3ToAlpha2(player.country_flag) || ''}
                      className="w-5 h-5 rounded shadow-sm"
                    />
                  )}
                  <span className="font-medium">{[player.first_name, player.last_name].filter(Boolean).join(' ').trim()}</span>
                </div>
              </TableCell>

              {/* Total Score with Enhanced Styling */}
              <TableCell className="text-center">
                <div
                  className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm ${
                    totalScore < 0
                      ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                      : totalScore > 0
                      ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                      : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                  }`}
                >
                  {totalStr}
                </div>
              </TableCell>

              {/* Thru Status */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {isLive && (
                    <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-0.5 font-bold shadow-md">
                      LIVE
                    </Badge>
                  )}
                  <Badge variant="secondary" className="px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm">
                    {player.thru || '-'}
                  </Badge>
                </div>
              </TableCell>

              {/* Current Round Score */}
              <TableCell className="text-center">
                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-sm ring-1 ring-primary/20">
                  {player?.score || '-'}
                </div>
              </TableCell>

              {/* Round Scores */}
              <TableCell className="text-center">
                <span className={getRoundScoreClass(player.r1)}>
                  {player.r1 ?? '-'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={getRoundScoreClass(player.r2)}>
                  {player.r2 ?? '-'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={getRoundScoreClass(player.r3)}>
                  {player.r3 ?? '-'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={getRoundScoreClass(player.r4)}>
                  {player.r4 ?? '-'}
                </span>
              </TableCell>

              {/* Total Strokes */}
              <TableCell className="text-center">
                <Badge variant="outline" className="font-semibold shadow-sm">
                  {player.strokes || '-'}
                </Badge>
              </TableCell>

              {/* Expand Icon */}
              <TableCell>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <Icon
                    className={`transition-all duration-300 ${isActive ? 'rotate-180' : ''}`}
                    name="chevron-down"
                    size={18}
                  />
                </div>
              </TableCell>
            </TableRow>

            {/* Score Card */}
            {isActive && (
              <TableRow>
                <TableCell colSpan={11} className="p-0 bg-muted/20">
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
