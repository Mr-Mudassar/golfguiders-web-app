'use client';

import { useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setAllFriendsCount } from '@/lib/redux/slices';
import { GetUserFriendsCount } from '@/app/[locale]/(app)/dashboard/friends/_query';

/**
 * Runs once when the app loads (authenticated): fetches getUserFriendsCount,
 * stores in Redux. Does not refetch on navigation. UI reads from Redux
 * (profile card, friends sidebar, profile page for own profile).
 */
export function FriendsCountInitializer() {
  const userId = useAppSelector((state) => state.auth.user?.userid);
  const dispatch = useAppDispatch();
  const hasFetchedRef = useRef(false);

  const [fetchCount] = useLazyQuery<{ getUserFriendsCount: number }>(
    GetUserFriendsCount
  );

  useEffect(() => {
    if (!userId || hasFetchedRef.current) return;

    const runFetch = () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      (async () => {
        try {
          const result = await fetchCount({
            variables: { userId },
          });
          const count = result?.data?.getUserFriendsCount ?? 0;
          dispatch(setAllFriendsCount(count));
        } catch {
          // Silent
        }
      })();
    };

    // Defer so initial paint and auth aren't blocked
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(runFetch, { timeout: 400 });
    } else {
      timeoutId = setTimeout(runFetch, 150);
    }

    return () => {
      if (idleId !== undefined && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [userId, dispatch, fetchCount]);

  return null;
}
