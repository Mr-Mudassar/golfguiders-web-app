'use client';

import { useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  setAllBellNotificationsData,
  setUnreadNotificationsCount,
} from '@/lib/redux/slices/notifications';
import type {
  GetAllNotificationsType,
  GetAllNotificationsVariablesType,
  GetUnseenBellNotificationCountType,
} from '@/components/app/common/notifications/_interface';
import {
  GetAllNotifications,
  GetUnseenBellNotificationCount,
} from '@/components/app/common/notifications/_query';

/**
 * Runs once on app load (hard reload): fetches getBellNotificationByUser(1)
 * and getUnSeenBellNotificationCount, stores in Redux. Does not refetch on
 * dropdown open or soft navigation.
 */
export function BellNotificationsInitializer() {
  const userId = useAppSelector((state) => state.auth.user?.userid);
  const dispatch = useAppDispatch();
  const hasFetchedRef = useRef(false);

  const [fetchNotifications] = useLazyQuery<
    GetAllNotificationsType,
    GetAllNotificationsVariablesType
  >(GetAllNotifications);

  const [fetchCount] = useLazyQuery<GetUnseenBellNotificationCountType>(
    GetUnseenBellNotificationCount
  );

  useEffect(() => {
    if (!userId || hasFetchedRef.current) return;

    const runFetch = () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      (async () => {
        try {
          const [notifResult, countResult] = await Promise.all([
            fetchNotifications({ variables: { pageState: 1 } }),
            fetchCount(),
          ]);

          const list = notifResult.data?.getBellNotificationByUser ?? [];
          const count = countResult.data?.getUnSeenBellNotificationCount ?? 0;

          dispatch(setAllBellNotificationsData(list));
          dispatch(setUnreadNotificationsCount(count));
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
  }, [userId, dispatch, fetchNotifications, fetchCount]);

  return null;
}
