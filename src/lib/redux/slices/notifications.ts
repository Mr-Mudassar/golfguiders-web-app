import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Bell notification as returned by getBellNotificationByUser API */
export interface BellNotificationStored {
  id: string | null;
  type: string;
  content: {
    message: string;
    created: string;
    url: string | null;
    __typename?: string;
  };
  metadata: {
    action_id: string;
    action_created: string;
    __typename?: string;
  };
  sender: {
    userid?: string;
    first_name?: string;
    last_name?: string;
    photo_profile?: string | null;
    __typename?: string;
  };
  read: boolean;
  seen: boolean;
  __typename?: string;
}

interface NotificationsState {
  allBellNotificationsData: BellNotificationStored[];
  unreadNotificationsCount: number;
}

const initialState: NotificationsState = {
  allBellNotificationsData: [],
  unreadNotificationsCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setAllBellNotificationsData(
      state,
      action: PayloadAction<BellNotificationStored[]>
    ) {
      state.allBellNotificationsData = action.payload;
    },

    setUnreadNotificationsCount(state, action: PayloadAction<number>) {
      state.unreadNotificationsCount = Math.max(0, action.payload);
    },

    incrementUnreadNotificationsCount(state) {
      state.unreadNotificationsCount += 1;
    },

    appendBellNotifications(
      state,
      action: PayloadAction<BellNotificationStored[]>
    ) {
      const existingIds = new Set(
        state.allBellNotificationsData.map(
          (n) => n.content?.created ?? n.id ?? ''
        )
      );
      action.payload.forEach((n) => {
        const key = n.content?.created ?? n.id ?? '';
        if (key && !existingIds.has(key)) {
          existingIds.add(key);
          state.allBellNotificationsData.push(n);
        }
      });
    },

    markBellNotificationAsRead(
      state,
      action: PayloadAction<{ created: string }>
    ) {
      const { created } = action.payload;
      const n = state.allBellNotificationsData.find(
        (x) => x.content?.created === created
      );
      if (n && !n.read) {
        n.read = true;
        state.unreadNotificationsCount = Math.max(
          0,
          state.unreadNotificationsCount - 1
        );
      }
    },

    resetNotifications() {
      return initialState;
    },
  },
});

export const {
  setAllBellNotificationsData,
  setUnreadNotificationsCount,
  incrementUnreadNotificationsCount,
  appendBellNotifications,
  markBellNotificationAsRead,
  resetNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
