'use client';

import { useAppSelector } from '@/lib/hooks';
import { useFirestoreNotifications } from '@/lib/firebase/use-firestore-notifications';

/**
 * Mount this inside the app layout so Firestore push notifications
 * for the current user are subscribed and written to Redux.
 */
export function NotificationsFirestoreListener() {
  const userId = useAppSelector((state) => state.auth.user?.userid);
  useFirestoreNotifications(userId);
  return null;
}
