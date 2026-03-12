'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  type Firestore,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { useAppDispatch } from '..';
import { useEffect, useRef } from 'react';
import type { Unsubscribe } from 'firebase/firestore';
import { getFirestoreInstance } from './firebase-config';
import { appendBellNotifications, incrementUnreadNotificationsCount } from '../redux/slices';

const BUCKET_ENV = 'FIRESTORE_NOTIFICATION_BUCKET';
const USER_FIELD = 'receiver.userid'; // Field path in Firestore: receiver.userid (lowercase)

/** Delay before attaching Firestore listener so initial API calls (notifications + count) run first */
const FIREBASE_LISTENER_DELAY_MS = 400;

interface FirestoreNotificationPayload {
  type?: string;
  content?: { message?: string; url?: string };
  senderProfilePhoto?: string;
}

function showBrowserNotification(item: FirestoreNotificationPayload) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const body = item.content?.message ?? '';
  const senderProfilePhoto = item.senderProfilePhoto ?? '';
  if (!body) return;

  const doShow = () => {
    try {
      const n = new Notification("GolfGuiders", { body, icon: senderProfilePhoto || '/favicon.ico' });
      n.onclick = () => {
        n.close();
        if (item.content?.url && typeof window !== 'undefined') window.focus();
      };
    } catch {
      // Silent fail
    }
  };

  if (Notification.permission === 'granted') {
    doShow();
    return;
  }
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((p) => {
      if (p === 'granted') doShow();
    });
  }
}

export function useFirestoreNotifications(userId: string | undefined) {
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;

    const timer = window.setTimeout(() => {
      const firestoreDb: Firestore | null = getFirestoreInstance();
      if (!firestoreDb) return;

      const bucket =
        (process.env[BUCKET_ENV] as string) ?? 'dev_notification_activity';

      try {
        const col = collection(firestoreDb, bucket);
        const q = query(col, where(USER_FIELD, '==', userId));

        unsubscribeRef.current = onSnapshot(
          q,
          (snapshot: QuerySnapshot<DocumentData>) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added' || change.type === 'modified') {
                const data = change.doc.data() as Record<string, unknown>;
                const dataToAppend = {
                  id: data.id as string,
                  type: data.type as string,
                  content: {
                    created: (data.content as Record<string, unknown>).created as string,
                    message: (data.content as Record<string, unknown>).message as string,
                    url: (data.content as Record<string, unknown>).url as string,
                  },
                  metadata: {
                    action_id: (data.metadata as Record<string, unknown>).action_id as string,
                    action_created: (data.metadata as Record<string, unknown>).action_created as string,
                  },
                  sender: {
                    userid: (data.sender as Record<string, unknown>).userid as string,
                    first_name: (data.sender as Record<string, unknown>).first_name as string,
                    last_name: (data.sender as Record<string, unknown>).last_name as string,
                    photo_profile: (data.sender as Record<string, unknown>).photo_profile as string,
                  },
                  read: false,
                  seen: false,
                };

                dispatch(appendBellNotifications([dataToAppend]));
                dispatch(incrementUnreadNotificationsCount());

                const content = (data.content as Record<string, unknown>) ?? {};
                showBrowserNotification({
                  type: data.type as string,
                  content: {
                    message: content.message as string,
                    url: content.url as string,
                  },
                  senderProfilePhoto: (data.sender as Record<string, unknown>).photo_profile as string,
                });
              }
            });
          },
          () => {
            // Silent fail
          }
        );
      } catch {
        // Silent fail
      }
    }, FIREBASE_LISTENER_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, dispatch]);
}
