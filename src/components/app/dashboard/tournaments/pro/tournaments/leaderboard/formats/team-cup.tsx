import React, { useState } from 'react';
import { TableRow, TableCell, Badge } from '@/components/ui';
import { getName } from '@/lib/utils';
import { Icon } from '@/components/ui';
import { Users } from 'lucide-react';
import { TeamCupEntry } from '../../../_interface';
import { ScoreCard } from '../../score-card';
import AvatarBox from '@/components/app/common/avatar-box';
import Image from 'next/image';

interface TeamCupLeaderboardProps {
  matches: Record<string, TeamCupEntry[]>;
}

export const TeamCupLeaderboard: React.FC<TeamCupLeaderboardProps> = ({
  matches,
}) => {
  const [activeScoreCard, setActiveScoreCard] = useState<string | null>(null);

  // Calculate match score display (e.g., "2 UP", "AS", "1 DOWN")
  const getMatchScoreDisplay = (players: TeamCupEntry[]) => {
    if (!players || players.length === 0) return null;

    const teamScores = players.map(p => ({
      team: p.team_name,
      score: parseFloat(p.team_score || '0'),
      color: p.team_color,
    }));

    if (teamScores.length < 2) return null;

    const sortedByScore = teamScores.sort((a, b) => b.score - a.score);
    const diff = sortedByScore[0].score - sortedByScore[1].score;

    if (diff === 0) {
      return { text: 'AS', color: 'text-gray-600', label: 'All Square' };
    }

    const upDown = diff > 0 ? 'UP' : 'DOWN';
    const absDiff = Math.abs(diff);
    return {
      text: `${absDiff} ${upDown}`,
      color: sortedByScore[0].color,
      label: sortedByScore[0].team,
    };
  };

  return (
    <>
      {Object.entries(matches).map(([matchId, matchPlayers]) => {
        const isActive = activeScoreCard === matchId;
        const firstPlayer = matchPlayers[0];
        const matchScore = getMatchScoreDisplay(matchPlayers);

        // Sort players by team name (United States, International, Europe)
        const sortedPlayers = matchPlayers?.slice().sort((a, b) => b.team_name.localeCompare(a.team_name));

        return (
          <React.Fragment key={matchId}>
            {/* Match Row - Each player in separate column */}
            <TableRow
              className={`cursor-pointer transition-all duration-200 hover:bg-muted/60 hover:shadow-sm ${
                isActive
                  ? 'bg-muted/40 border-l-[6px] border-primary shadow-md'
                  : 'border-l-[6px] border-transparent'
              }`}
              onClick={() => setActiveScoreCard(isActive ? null : matchId)}
            >
              {/* Group Column - Compact */}
              <TableCell className="py-6 w-24">
                <div className="flex items-center justify-center">
                  <div className="p-2 rounded-lg bg-primary/15 ring-2 ring-primary/20 shadow-sm">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="text-center mt-1.5">
                  <span className="text-xs font-bold text-muted-foreground">#{matchId}</span>
                </div>
              </TableCell>

              {/* Each Player in Separate Column */}
              {sortedPlayers?.map((player) => (
                <TableCell key={player.player_id} className="py-6">
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border-2 hover:shadow-lg transition-all duration-200 h-[88px]"
                      style={{
                        backgroundColor: `${player.team_color}08`,
                        borderColor: `${player.team_color}30`,
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <AvatarBox
                          className="size-14 z-10 bg-muted ring-3 ring-background shadow-md"
                          src={player?.image_url || ''}
                          name={getName(player.first_name, player.last_name)}
                        />
                        <div
                          className="absolute -bottom-1 -right-1 size-6 rounded-full z-20 ring-3 ring-background flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: player.team_color }}
                        >
                          <Image
                            src={player.team_flag}
                            alt={player.team_name}
                            width={20}
                            height={20}
                            className="size-4 rounded-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="font-bold text-base truncate leading-tight mb-1">
                          {getName(player.first_name, player.last_name)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full ring-2 ring-background shadow-sm flex-shrink-0"
                            style={{ backgroundColor: player.team_color }}
                          />
                          <span className="text-sm text-muted-foreground font-medium truncate">
                            {player.team_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score and Through status below player card */}
                    <div className="flex items-center justify-center gap-3 px-2">
                      {player.team_score && (
                        <div
                          className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                          style={{
                            backgroundColor: `${player.team_color}15`,
                            color: player.team_color,
                          }}
                        >
                          {parseFloat(player.team_score) > 0 ? '+' : ''}{player.team_score}
                        </div>
                      )}
                      {player.thru && player.thru !== '0' && (
                        <div className="px-2 py-1 rounded bg-muted text-xs font-semibold text-muted-foreground">
                          Thru {player.thru}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              ))}

              {/* Status + Match Score + Chevron Combined */}
              <TableCell className="py-6 w-40">
                <div className="space-y-2">
                  {/* Match Score Display */}
                  {matchScore && (
                    <div className="flex items-center justify-center">
                      <div
                        className="px-4 py-2 rounded-lg text-lg font-extrabold shadow-md border-2"
                        style={{
                          backgroundColor: `${matchScore.color}15`,
                          color: matchScore.color,
                          borderColor: `${matchScore.color}30`,
                        }}
                      >
                        {matchScore.text}
                      </div>
                    </div>
                  )}

                  {/* Match Format and Status */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Show match format badge only if it doesn't contain "Group" (avoid redundancy) */}
                    {firstPlayer.match_title && !firstPlayer.match_title.toLowerCase().includes('group') && (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium px-2 py-0.5"
                      >
                        {firstPlayer.match_title}
                      </Badge>
                    )}
                    {/* Hide "Final" badge when match score is displayed, show other statuses */}
                    {firstPlayer.match_status !== 'Final' && (
                      <Badge
                        variant={
                          firstPlayer.match_status === 'In Progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="px-3 py-1 font-semibold text-sm shadow-sm"
                      >
                        {firstPlayer.match_status}
                      </Badge>
                    )}
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                      <Icon
                        className={`transition-all duration-300 ${isActive ? 'rotate-180' : ''}`}
                        name="chevron-down"
                        size={18}
                      />
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Score Card - Shows for entire match */}
            {isActive && (
              <TableRow>
                <TableCell colSpan={5} className="p-0 bg-muted/20">
                  <ScoreCard
                    player={{
                      id: matchId,
                      name: `Group ${matchId}`,
                    }}
                    isTeamCup={true}
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
