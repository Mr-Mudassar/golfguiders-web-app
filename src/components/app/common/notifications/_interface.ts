import type { BellNotification } from '@/lib/definitions';

export interface GetAllNotificationsType {
  getBellNotificationByUser: BellNotification[];
}

export interface GetAllNotificationsVariablesType {
  pageState: number;
}

export interface GetUnseenBellNotificationCountType {
  getUnSeenBellNotificationCount: number;
}

export interface UpdateBellNotificationReadVariablesType {
  notification_user_id: string;
  created: string;
}
