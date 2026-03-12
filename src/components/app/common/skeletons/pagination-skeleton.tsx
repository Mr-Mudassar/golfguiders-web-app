import { PostCardSkeleton } from '../post-card/post-card-skeleton';
import { AccountSkeleton } from './account-skeleton';
import { TicketSkeleton } from '../../dashboard/tournaments/pro/tournaments/tickets/skeleton';
import { GameCardSkeleton } from '../tournament/skeleton';

interface PaginationSkeletonProps {
  type: 'post' | 'account' | 'ticket' | 'game';
  count?: number;
}

export const PaginationSkeleton = ({
  type,
  count = 3,
}: PaginationSkeletonProps) => {
  const components = {
    post: PostCardSkeleton,
    account: AccountSkeleton,
    ticket: TicketSkeleton,
    game: GameCardSkeleton,
  };

  const Component = components[type];

  return (
    <div className="space-y-3 mt-4 animate-in fade-in duration-200">
      <Component count={count} />
    </div>
  );
};
