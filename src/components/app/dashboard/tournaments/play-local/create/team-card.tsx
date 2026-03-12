import { Button, Icon } from '@/components/ui';
import type { Team, IPlayer } from '../_interface';
import { Users, Trash2, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarBox from '@/components/app/common/avatar-box';

export function TeamCard({
  team,
  index,
  players,
  onRemove,
  onEdit,
  onRemovePlayer,
}: {
  team: Team;
  index: number;
  players: IPlayer[];
  onRemove: () => void;
  onEdit: () => void;
  onRemovePlayer: (userId: string) => void;
}) {
  const custom = team?.tee_color.length > 1;
  const hasPlayers = team.team_player.length > 0;
  const hasEnoughPlayers = team.team_player.length >= 2;

  // Resolve player IDs to player objects
  const teamPlayers = team.team_player
    .map((id) => players.find((p) => p.user_id === id))
    .filter(Boolean) as IPlayer[];

  return (
    <div className={cn(
      'rounded-xl border p-3.5 transition-all',
      hasEnoughPlayers
        ? 'border-primary/30 bg-primary/5'
        : 'border-border/60 bg-card'
    )}>
      <div className="flex items-center justify-between gap-3">
        {/* Team info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
            hasEnoughPlayers
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground border border-border'
          )}>
            {index}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {team.team_name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn(
                'text-xs flex items-center gap-1',
                hasEnoughPlayers ? 'text-primary' : 'text-muted-foreground'
              )}>
                <Users className="w-3 h-3" />
                {team.team_player.length} player{team.team_player.length !== 1 ? 's' : ''}
              </span>
              {team?.tee_color?.[0] && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {custom ? (
                    <>
                      <span className="flex -space-x-1">
                        {team.tee_color.map((c, i) => (
                          <span
                            key={i}
                            className="size-2.5 rounded-full border border-background"
                            style={{ backgroundColor: `#${c}` }}
                          />
                        ))}
                      </span>
                      Custom
                    </>
                  ) : (
                    <>
                      <span
                        className="size-2.5 rounded-full border"
                        style={{ backgroundColor: `#${team.tee_color[0]}` }}
                      />
                      {team.tee_marker}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant={hasPlayers ? 'outline' : 'default'}
            size="sm"
            onClick={onEdit}
            className="h-8 text-xs gap-1"
          >
            {hasPlayers ? (
              <>
                <Icon name="edit" className="size-3" />
                Edit
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" />
                Add Players
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Player list */}
      {teamPlayers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
          {teamPlayers.map((p) => (
            <div
              key={p.user_id}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-background/60 border border-border/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AvatarBox
                  className="w-6 h-6 shrink-0 text-[9px]"
                  name={p.name}
                  src={''}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.hcp != null ? `${p.hcp} HCP` : 'No HCP'}
                    {p.tee ? ` · ${p.tee}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemovePlayer(p.user_id)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
