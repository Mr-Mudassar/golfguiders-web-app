import React from 'react';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import type { TournamentStageType } from './pro/tournaments/_query';

interface TournamentCardProps {
  readonly className?: string;
  tournamentStage: TournamentStageType;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  className,
  tournamentStage,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleClick = React.useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tournamentId', tournamentStage.id);
    replace(`${pathname}?${params.toString()}`);
  }, [searchParams, tournamentStage, pathname, replace]);

  return (
    <button
      className={cn(
        'flex items-center gap-2 justify-between p-2 pl-3 bg-transparent hover:bg-muted transition-colors group w-full text-left rounded-md',
        className,
        {
          'bg-secondary text-secondary-foreground hover:bg-secondary/80':
            searchParams.has('tournamentId') &&
            searchParams.get('tournamentId') === tournamentStage.id,
        }
      )}
      onClick={handleClick}
    >
      <div>
        <h4 className="font-medium text-sm">{tournamentStage.name}</h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <p>{new Date(tournamentStage.ut).toDateString()}</p>
          <span>•</span>
          <p>{tournamentStage.country_name}</p>
        </div>
      </div>

      <Icon
        className="opacity-0 group-hover:opacity-100 transition-all"
        name="chevron-right"
        size={24}
      />
    </button>
  );
};

export { TournamentCard };
