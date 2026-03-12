import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProScores, TeamCupHole, TeamCupPlayer } from '../../_interface';
import { teeColor } from '../_utils';

interface TeamCupScoreCardProps {
  matchId: string;
  groupName: string;
  players: TeamCupPlayer[];
  scoreData?: ProScores;
}

export const TeamCupScoreCard: React.FC<TeamCupScoreCardProps> = ({
  matchId,
  groupName,
  players,
  scoreData,
}) => {
  const [activeRound, setActiveRound] = useState<number>(0);
  const [activeNine, setActiveNine] = useState<'front' | 'back'>('front');
  const [hoveredHole, setHoveredHole] = useState<string | null>(null);

  const hasScoreData =
    scoreData && scoreData.players && scoreData.players.length > 0;

  const allPlayerHoles = useMemo(() => {
    if (!hasScoreData) return null;
    const result: Record<string, TeamCupHole[]> = {};
    scoreData?.players?.forEach((player) => {
      const round = player?.rounds[activeRound];
      if (round && round.holes) {
        result[player?.player_id] = round.holes;
      }
    });
    return result;
  }, [scoreData, activeRound, hasScoreData]);

  const hasBackNine = useMemo(() => {
    if (!allPlayerHoles) return false;
    const firstPlayerHoles = Object.values(allPlayerHoles)[0] || [];
    return firstPlayerHoles.some((hole) => hole.hole_number > 9);
  }, [allPlayerHoles]);

  const activeHoleNumbers = useMemo(() => {
    if (!allPlayerHoles) return [];
    const firstPlayerHoles = Object.values(allPlayerHoles)[0] || [];
    const holes =
      activeNine === 'front'
        ? firstPlayerHoles.filter((h) => h.hole_number <= 9)
        : firstPlayerHoles.filter((h) => h.hole_number > 9);
    return holes.map((h) => h.hole_number);
  }, [allPlayerHoles, activeNine]);


  if (!hasScoreData) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {groupName} - Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Scorecard data will appear when the match begins</p>
            <p className="text-sm mt-1">Match ID: {matchId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableRounds = scoreData?.players?.[0]?.rounds || [];

  return (
    <Card className="mt-4 border-2 shadow-sm">
      <CardHeader className="pb-4 bg-muted/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold">{groupName}</span>
            <Badge variant="secondary" className="ml-1 font-semibold px-3 py-1">
              {players.length} players
            </Badge>
          </CardTitle>

          {availableRounds.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Round:</span>
              <div className="flex gap-2">
                {availableRounds.map((round, index) => (
                  <Button
                    key={round.number}
                    variant={activeRound === index ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 font-semibold transition-all"
                    onClick={() => setActiveRound(index)}
                  >
                    {round.number}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Nine Selection */}
        {hasBackNine && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border-2 shadow-sm bg-background" role="group">
              <Button
                variant={activeNine === 'front' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none font-semibold px-5 h-10"
                onClick={() => setActiveNine('front')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Front Nine (1-9)
              </Button>
              <Button
                variant={activeNine === 'back' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none font-semibold px-5 h-10"
                onClick={() => setActiveNine('back')}
              >
                Back Nine (10-18)
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* CORRECTED TABLE: PLAYERS AS ROWS, HOLES AS COLUMNS */}
        <div className="overflow-x-auto rounded-lg border-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/95">
                <TableHead className="w-40 text-white font-extrabold text-sm border-r-2 border-white/20 sticky left-0 z-10 bg-primary">
                  Hole
                </TableHead>
                {activeHoleNumbers.map((holeNumber) => (
                  <TableHead
                    key={holeNumber}
                    className="text-center text-white font-extrabold text-base min-w-20 border-r border-white/10"
                  >
                    {holeNumber}
                  </TableHead>
                ))}
                <TableHead className="text-center text-white font-extrabold text-base min-w-24 border-l-4 border-white/30 bg-primary/90">
                  TOT
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* PAR ROW */}
              <TableRow className="bg-muted/50 border-b-2">
                <TableCell className="font-extrabold text-sm border-r-2 border-border sticky left-0 bg-muted/50 z-10">
                  Par
                </TableCell>
                {activeHoleNumbers.map((holeNumber) => {
                  const firstPlayerHoles =
                    allPlayerHoles?.[players[0]?.player_id] || [];
                  const hole = firstPlayerHoles.find(
                    (h) => h.hole_number === holeNumber
                  );
                  return (
                    <TableCell
                      key={`par-${holeNumber}`}
                      className="text-center font-bold text-base text-foreground border-r"
                    >
                      {hole?.par || '-'}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-extrabold text-base border-l-4 bg-muted/30">
                  {activeHoleNumbers.reduce((sum, holeNumber) => {
                    const firstPlayerHoles =
                      allPlayerHoles?.[players[0]?.player_id] || [];
                    const hole = firstPlayerHoles.find(
                      (h) => h.hole_number === holeNumber
                    );
                    return sum + (hole?.par || 0);
                  }, 0)}
                </TableCell>
              </TableRow>

              {/* PLAYER ROWS */}
              {players.map((player, playerIndex) => {
                const playerHoles = allPlayerHoles?.[player.player_id] || [];

                const playerTotal = activeHoleNumbers.reduce(
                  (sum, holeNumber) => {
                    const hole = playerHoles.find(
                      (h) => h.hole_number === holeNumber
                    );
                    return sum + parseInt(hole?.score || '0');
                  },
                  0
                );

                const playerPointsTotal = activeHoleNumbers.reduce(
                  (sum, holeNumber) => {
                    const hole = playerHoles.find(
                      (h) => h.hole_number === holeNumber
                    );
                    return sum + parseFloat(hole?.points || '0');
                  },
                  0
                );

                return (
                  <React.Fragment key={player.player_id}>
                    {/* Player Score Row */}
                    <TableRow
                      className={
                        playerIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                      }
                    >
                      <TableCell className="font-semibold text-sm min-w-48 border-r-2 border-border sticky left-0 z-10"
                        style={{
                          backgroundColor: playerIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted) / 0.1)'
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          {player.team_flag && (
                            <Image
                              src={player.team_flag}
                              alt={player.team_name}
                              width={20}
                              height={20}
                              className="size-5 rounded shadow-sm"
                            />
                          )}
                          <span
                            className="size-3.5 rounded-full ring-2 ring-background"
                            style={{ backgroundColor: player?.team_color }}
                          />
                          <span>{player.first_name[0]}. {player.last_name}</span>
                        </div>
                      </TableCell>

                      {activeHoleNumbers.map((holeNumber) => {
                        const h = playerHoles.find(
                          (h) => h.hole_number === holeNumber
                        );
                        const scoreStatus = h?.status ?? h?.team_status ?? '';
                        const scoreDiff = Number(h?.score ?? h?.team_score) - (h?.par || 0);
                        const bgColor =
                          scoreStatus === 'EAGLE' ? 'bg-blue-100' :
                          scoreStatus === 'BIRDIE' ? 'bg-green-100' :
                          scoreStatus === 'BOGEY' ? 'bg-yellow-100' :
                          scoreStatus === 'DOUBLE_BOGEY+' ? 'bg-red-100' : '';

                        return (
                          <TableCell
                            key={h?.hole_number}
                            onMouseEnter={() => setHoveredHole(player.player_id + h?.hole_number!)}
                            onMouseLeave={() => setHoveredHole(null)}
                            className="p-0 border-r"
                          >
                            <div
                              className={`text-center ${bgColor} ${teeColor(scoreStatus)} p-3 relative group transition-colors`}
                            >
                              <div className="font-bold text-base relative z-10">
                                {Number(h?.score ?? h?.team_score)}
                                {scoreDiff !== 0 && (
                                  <span className="ml-1 text-xs">
                                    ({scoreDiff > 0 ? '+' : ''}{scoreDiff})
                                  </span>
                                )}
                              </div>

                              {hoveredHole === (player.player_id + h?.hole_number) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <ScoreBadge
                                    status={scoreStatus}
                                  />
                                </div>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}

                      <TableCell
                        style={{
                          borderLeft: '4px solid',
                          borderColor: player?.team_color,
                          backgroundColor: `${player?.team_color}18`,
                        }}
                        className="text-center font-extrabold text-lg"
                      >
                        {playerTotal}
                      </TableCell>
                    </TableRow>

                    {/* Player Points Row */}
                    <TableRow
                      className={
                        playerIndex % 2 === 0 ? 'bg-background border-b-2' : 'bg-muted/10 border-b-2'
                      }
                    >
                      <TableCell className="text-sm font-semibold text-muted-foreground border-r-2"
                        style={{
                          backgroundColor: playerIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted) / 0.1)'
                        }}
                      >
                        <div className="pl-6">Points</div>
                      </TableCell>

                      {activeHoleNumbers.map((holeNumber) => {
                        const hole = playerHoles.find(
                          (h) => h.hole_number === holeNumber
                        );
                        const points = parseFloat(hole?.points || '0');
                        const isWinner = points > 0;
                        const isTied = points === 0.5;

                        return (
                          <TableCell
                            key={`points-${player.player_id}-${holeNumber}`}
                            className="text-center border-r p-3"
                          >
                            <div className="flex relative items-center justify-center">
                              {isWinner && (
                                <div
                                  className="absolute inset-0 rounded"
                                  style={{
                                    backgroundColor: `${player.team_color}20`,
                                  }}
                                />
                              )}
                              <span
                                className={`text-sm z-10 font-bold ${
                                  isWinner ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                                style={isWinner ? { color: player.team_color } : {}}
                              >
                                {hole?.points || '0'}
                                {isWinner && !isTied && ' ✓'}
                              </span>
                            </div>
                          </TableCell>
                        );
                      })}

                      <TableCell
                        style={{
                          borderLeft: '4px solid',
                          borderColor: player?.team_color,
                          backgroundColor: `${player?.team_color}18`,
                        }}
                        className="text-center font-extrabold text-base"
                      >
                        {playerPointsTotal.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Color Legend */}
        <div className="mt-6 pt-4 border-t-2">
          <h4 className="text-sm font-bold text-muted-foreground mb-3 text-center">Score Legend</h4>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">E</span>
              </div>
              <span className="text-sm font-medium text-blue-600">Eagle (-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-green-100 border-2 border-green-200 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">B</span>
              </div>
              <span className="text-sm font-medium text-green-600">Birdie (-1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">P</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Par (E)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-yellow-100 border-2 border-yellow-200 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-600">+1</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">Bogey (+1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-red-100 border-2 border-red-200 flex items-center justify-center">
                <span className="text-xs font-bold text-red-600">+2</span>
              </div>
              <span className="text-sm font-medium text-red-600">Double Bogey+ (+2)</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Points:</span> Highlighted cells with ✓ indicate hole winners
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ScoreBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  const configs = {
    EAGLE: { color: 'bg-blue-500 text-white', icon: '🦅' },
    BIRDIE: { color: 'bg-green-500 text-white', icon: '🐦' },
    PAR: { color: 'bg-gray-200 text-gray-800', icon: '•' },
    BOGEY: { color: 'bg-yellow-500 text-white', icon: '⛳' },
    'DOUBLE_BOGEY+': { color: 'bg-red-500 text-white', icon: '💥' },
  };

  const config = configs[status as keyof typeof configs] || configs.PAR;

  return (
    <span
      className={`absolute inline-flex transition-all z-0 group-hover:z-20 opacity-40 group-hover:opacity-100 items-center gap-1 px-2 py-0 rounded-full text-xs ${config.color}`}
    >
      {/* <span>{config.icon}</span> */}
      <span className="font-medium transition-all text-xxs opacity-0 w-0 group-hover:w-8 group-hover:opacity-100">
        {status.replace('_', ' ')}
      </span>
    </span>
  );
};
