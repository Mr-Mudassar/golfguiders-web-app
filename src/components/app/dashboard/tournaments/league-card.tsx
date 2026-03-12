import React from 'react';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ProTournamentFormats, ProTournaments } from './pro/_interface';
import { useAppDispatch } from '@/lib';
import { setActiveTournament } from '@/lib/redux/slices';
import Link from 'next/link';
import Image from 'next/image';


interface LeagueCardProps {
  readonly className?: string;
  league: ProTournaments;
}

const LeagueCard: React.FC<LeagueCardProps> = ({ className, league }) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(
      setActiveTournament({
        gameId: league?.id,
        name: league?.name,
        status: league?.status,
        type: league?.tour,
        format: league?.tournament_type as ProTournamentFormats,
      })
    );
  };

  return (
    <Link
      href={`pro/${league?.id}`}
      className={cn(
        'flex items-center gap-3 justify-between px-4 py-3 hover:bg-muted/50 transition-all group w-full',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3 items-center flex-1 min-w-0">
        <div className="shrink-0 size-11 rounded-lg bg-muted/40 flex items-center justify-center overflow-hidden">
          <Image
            src={league?.tournament_logo || ''}
            alt=""
            width={44}
            height={44}
            className="size-10 object-contain"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-sm truncate">{league?.name}</h4>
          <p className="text-xs text-muted-foreground">
            {league?.month} {league?.year}
          </p>
        </div>
      </div>
      <Icon
        name="chevron-right"
        size={16}
        className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </Link>
  );
};

export { LeagueCard };
