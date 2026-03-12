import React, { useState } from 'react';
import { TableRow, TableCell, Badge } from '@/components/ui';
import { Icon } from '@/components/ui';
import { Users } from 'lucide-react';
import { ScoreCard } from '../../score-card';
import { TeamStroke } from '../../../_interface';

interface TeamStrokeLeaderboardProps {
  teams: TeamStroke[];
  onTeamClick?: (teamId: string) => void;
}

export const TeamStrokeLeaderboard: React.FC<TeamStrokeLeaderboardProps> = ({
  teams,
}) => {
  const [activeScoreCard, setActiveScoreCard] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {}
  );

  // const toggleTeamExpansion = (teamId: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setExpandedTeams((prev) => ({
  //     ...prev,
  //     [teamId]: !prev[teamId],
  //   }));
  // };

  return (
    <>
      {teams?.map((team) => {
        const isActive = activeScoreCard === team?.id;
        // const isExpanded = expandedTeams[team.id];
        const fPlayer = team?.players[0];

        return (
          <React.Fragment key={team.id}>
            {/* Team Row */}
            <TableRow
              className={`cursor-pointer hover:bg-muted/50 ${isActive ? 'bg-secondary' : ''}`}
              onClick={() => setActiveScoreCard(isActive ? null : team.id)}
            >
              <TableCell>
                <Badge variant={team.pos === '1' ? 'default' : 'secondary'}>
                  {team?.pos}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-medium gap-2">
                      {team?.players?.map((p) => (
                        <p key={p?.player_id}>
                          {[p?.first_name, p?.last_name].filter(Boolean).join(' ').trim()}
                        </p>
                      ))}

                      {/* <button
                        onClick={(e) => toggleTeamExpansion(team.id, e)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button> */}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell
                className={`text-center font-semibold ${Number(fPlayer.total) < 0 ? 'text-destructive' : 'text-primary'}`}
              >
                {fPlayer.total}
              </TableCell>

              <TableCell className="text-center font-semibold">
                {fPlayer.thru || '-'}
              </TableCell>

              <TableCell className="text-center font-semibold">
                {fPlayer?.score || '-'}
              </TableCell>

              <TableCell className="text-center">{fPlayer.r1 ?? '-'}</TableCell>
              <TableCell className="text-center">{fPlayer.r2 ?? '-'}</TableCell>
              <TableCell className="text-center">{fPlayer.r3 ?? '-'}</TableCell>
              <TableCell className="text-center">{fPlayer.r4 ?? '-'}</TableCell>

              <TableCell className="text-center font-bold">
                {fPlayer?.strokes || '-'}
              </TableCell>

              <TableCell className="text-center">
                <Badge variant="outline">{fPlayer.projected}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="space-y-1 grid place-items-center">
                  {team?.players?.map((p) => (
                    <Badge key={p?.player_id} variant="outline">
                      {p?.starting}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <Icon
                  className={`transition-transform ${isActive ? 'rotate-180' : ''}`}
                  name="chevron-down"
                  size={14}
                />
              </TableCell>
            </TableRow>

            {/* Team Score Card */}
            {isActive && (
              <TableRow>
                <TableCell colSpan={13} className="p-0">
                  <ScoreCard
                    player={{
                      id: team?.id,
                      name: `Team ${team.pos}`,
                    }}
                    isTeam={true}
                    teamPlayers={team?.players}
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
