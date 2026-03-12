import { useState, useEffect } from 'react';
import AvatarBox from '@/components/app/common/avatar-box';
import { getName } from '@/lib/utils';
import type { CourseTeeDetails, User } from '@/lib/definitions';
import { IPlayer, ITeeMark, Team, UserSelectHandler } from '../_interface';
import { TeeDropDown } from './tee-drop-down';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';

export function UserCard({
  user,
  currPlayer,
  isSelected,
  defaultMark,
  team,
  teeData = [],
  isOrganizer = false,
  onSelect,
}: {
  user: User;
  currPlayer: IPlayer | undefined;
  isSelected: boolean;
  defaultMark: ITeeMark;
  team?: Team;
  teeData?: CourseTeeDetails[];
  isOrganizer?: boolean;
  onSelect: UserSelectHandler;
}) {
  const [hcp, setHcp] = useState<number | null>(() => {
    if (currPlayer?.hcp != null) return currPlayer.hcp;
    if (user?.handicap != null && user.handicap !== '') return Number(user.handicap);
    return null;
  });
  const [hcpPercent, setHcpPercent] = useState<number>(() => {
    const p = currPlayer?.hcp_percentage ?? 100;
    return Math.min(100, Math.max(0, Math.round(Number(p))));
  });

  // Local tee marker — only changed by the individual card's dropdown
  const [teeMarker, setTeeMarker] = useState<ITeeMark>({
    name: currPlayer?.tee ?? '',
    value: currPlayer?.tee_color ?? '',
    gen: currPlayer?.gender ?? '',
    order: currPlayer?.tee_order ?? '',
  });

  // Derived tee: default marker overrides local when set (immediate, no useEffect lag)
  const effectiveTee: ITeeMark = defaultMark?.name ? defaultMark : teeMarker;

  // Sync hcp, hcpPercent and tee values from currPlayer changes
  useEffect(() => {
    setHcp(currPlayer?.hcp ?? (user?.handicap != null && user.handicap !== '' ? Number(user.handicap) : null));
    if (currPlayer?.hcp_percentage != null) {
      setHcpPercent(Math.min(100, Math.max(0, Math.round(Number(currPlayer.hcp_percentage)))));
    }
  }, [currPlayer, user?.handicap]);

  // Sync tee marker when currPlayer tee changes (e.g. auto-assign after course change)
  useEffect(() => {
    if (currPlayer?.tee && currPlayer.tee !== teeMarker.name) {
      setTeeMarker({
        name: currPlayer.tee,
        value: currPlayer.tee_color ?? '',
        gen: currPlayer.gender ?? '',
        order: currPlayer.tee_order ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currPlayer?.tee, currPlayer?.tee_color, currPlayer?.tee_order]);

  const showHcpPercent = hcp != null && hcp >= 1;

  const isUpdating =
    isSelected &&
    !isOrganizer &&
    (currPlayer?.tee !== effectiveTee.name ||
      (showHcpPercent && currPlayer?.hcp_percentage !== hcpPercent));

  const getLabel = () => {
    if (!isSelected) return 'Add';
    if (isOrganizer) return 'Added';
    return isUpdating ? 'Update' : 'Added';
  };

  const handleClick = () => {
    if (!isSelected) {
      onSelect(user, hcp, hcpPercent, effectiveTee, 'add');
      return;
    }
    if (isOrganizer) {
      onSelect(user, hcp, hcpPercent, effectiveTee, 'add');
      return;
    }
    if (isUpdating) {
      onSelect(user, hcp, hcpPercent, effectiveTee, 'edit');
      return;
    }
    onSelect(user, hcp, hcpPercent, effectiveTee, 'add');
  };

  const fullName = getName(user?.first_name, user?.last_name);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all duration-200',
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
      )}
    >
      {/* Avatar */}
      <AvatarBox
        className="w-10 h-10 shrink-0"
        name={fullName}
        src={user?.photo_profile ?? ''}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
            {user?.type && (
              <p className="text-[11px] text-muted-foreground capitalize">
                {user.type.toLowerCase()}
              </p>
            )}
          </div>

          {/* Add/Added/Update button */}
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              'shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200',
              isSelected && !isUpdating
                ? 'bg-primary text-white border-primary'
                : isUpdating
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:text-primary'
            )}
          >
            {isSelected && !isUpdating ? (
              <>
                <Check className="w-3 h-3" />
                {getLabel()}
              </>
            ) : !isSelected ? (
              <>
                <Plus className="w-3 h-3" />
                {getLabel()}
              </>
            ) : (
              getLabel()
            )}
          </button>
        </div>

        {/* Player stats (non-organizer) */}
        {!isOrganizer && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* HCP (read-only from API) */}
            <div className="flex items-center h-7 px-2.5 rounded-lg bg-background border border-border/50 text-xs text-foreground">
              <span className="font-medium">{hcp != null ? `${hcp} HCP` : 'No HCP'}</span>
            </div>

            {/* HCP % (editable, only shown when HCP >= 1) */}
            {showHcpPercent && (
              <div className="flex items-center h-7 rounded-lg bg-background border border-border/50 text-xs text-foreground overflow-hidden">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hcpPercent}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Math.round(Number(e.target.value))));
                    setHcpPercent(val);
                  }}
                  className="w-10 h-full text-center text-xs font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="pr-2 font-medium text-muted-foreground">HCP%</span>
              </div>
            )}

            {/* Tee marker — hidden in team mode; team tee is applied via defaultMark */}
            {!team && (
              <TeeDropDown
                data={teeData}
                teeMarker={effectiveTee}
                size="sm"
                handleTeeSelect={setTeeMarker}
                handleTeeCancel={() =>
                  setTeeMarker({ name: '', value: '', gen: '', order: '' })
                }
              />
            )}
            {team && effectiveTee.name && (
              <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-background border border-border/50 text-xs text-foreground">
                <span
                  className="size-2.5 rounded-full border"
                  style={{ backgroundColor: `#${effectiveTee.value}` }}
                />
                <span className="font-medium">{effectiveTee.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
