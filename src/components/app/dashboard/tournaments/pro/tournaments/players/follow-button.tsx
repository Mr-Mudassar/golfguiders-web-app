import { useMutation } from '@apollo/client/react';
import { FollowMutate } from '../../_query';
import { useEffect, useState } from 'react';
import type {
  FollowPlayerResultType,
  FollowPlayerVariablesType,
  ProTournamentType,
} from '../../_interface';
import { toast } from 'sonner';
import { Button, Icon } from '@/components/ui';
import { useLeaderboard, useProTournaments } from '../../hook';
import { useAppSelector } from '@/lib';

type Prop = {
  activePlayer: {
    name: string;
    tour: ProTournamentType;
    is_following: boolean;
    id: string;
  };
  sm?: boolean;
  icon?: false;
  size?: 'sm' | 'lg' | 'default';
};

export const FollowButton = ({
  activePlayer: p,
  sm = false,
  icon,
  size = 'sm',
}: Prop) => {
  const [follow, followState] = useMutation<
    FollowPlayerResultType,
    FollowPlayerVariablesType
  >(FollowMutate, {
    // Explicitly refetch these queries after mutation succeeds
    refetchQueries: ['GetLeaderboard', 'GetPlayerDetail'],
    // Wait for refetch to complete before resolving
    awaitRefetchQueries: true,
  });
  const t = useAppSelector((s) => s.leagues.activeProLeague);

  const { refetch } = useLeaderboard(t?.type!, t?.gameId!);
  const { detail } = useProTournaments({
    details: { id: t?.gameId!, type: t?.type! },
  });

  const [isFollow, setIsFollow] = useState(p?.is_following);
  const [hover, setHover] = useState(false);

  // Sync from props only when the player changes (e.g. navigation). Do not sync on
  // every p?.is_following change, or refetched/stale data would overwrite the correct
  // state right after an unfollow and the button would stick on "Following".
  useEffect(() => {
    setIsFollow(p?.is_following);
  }, [p?.id]);

  const handleClick = async () => {
    // Prevent double-clicks
    if (followState.loading) return;

    const previousIsFollow = isFollow;

    try {
      // Optimistic: Toggle immediately
      setIsFollow(!isFollow);
      toast(`${!isFollow ? 'Following' : 'Unfollowing'} ${p?.name}...`);

      const { data } = await follow({
        variables: {
          tournament: p?.tour,
          player_id: p?.id,
          is_follow: !previousIsFollow, // Use previous value to toggle
        },
      });

      if (data?.followPlayer !== undefined) {
        // Use the state we requested for the UI; API sometimes returns wrong followPlayer
        // (e.g. returns true when we unfollow), so trust our payload so the button is correct.
        const requestedState = !previousIsFollow;
        setIsFollow(requestedState);
        toast.success(
          `${requestedState ? 'Following' : 'Unfollowed'} ${p?.name}`
        );

        // Refetch GetPlayerDetail and leaderboard so profile and lists show latest data
        try {
          if (refetch) await refetch();
          if (detail?.refetch) await detail.refetch();
        } catch (error) {
          console.error('Refetch failed:', error);
        }
      } else {
        // Server didn't return expected data - rollback
        setIsFollow(previousIsFollow);
        toast.error('Failed to update follow status');
      }
    } catch (error) {
      // Rollback: Restore previous state
      setIsFollow(previousIsFollow);
      console.error('Follow mutation failed:', error);
      toast.error('Cannot follow this player. Please try again.');
    }
  };
  return (
    <div className="flex gap-2 items-center">
      {icon && (
        <Icon
          fill={isFollow ? 'currentColor' : 'transparent'}
          name={!isFollow ? 'star' : 'star-off'}
        />
      )}
      <Button
        size={size}
        loading={followState?.loading}
        disabled={followState?.loading}
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        variant={isFollow ? (hover ? 'outline' : 'default') : 'default'}
        className={
          isFollow
            ? hover
              ? sm ? '' : 'text-sm px-4 py-1 border rounded'
              : sm ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'text-sm px-4 py-1 border rounded bg-teal-600 hover:bg-teal-700 text-white'
            : sm ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : 'text-sm px-4 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
        }
      >
        {isFollow ? (hover ? 'Unfollow?' : 'Following') : 'Follow'}
      </Button>
    </div>
  );
};
