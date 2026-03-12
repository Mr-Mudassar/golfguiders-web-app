import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  savedPosts: string[];
  favorites: string[];
  friendIds: string[];
  blockedUsers: string[];
  sentRequests: string[];
  receiveReq: string[];
  friendsLoaded: boolean;
  isRefreshPost: number | null;
  allFriendsCount: number;
  sentFriendRequestCount: number;
}

const initialState: UserState = {
  savedPosts: [],
  favorites: [],
  friendIds: [],
  blockedUsers: [],
  sentRequests: [],
  receiveReq: [],
  friendsLoaded: false,
  isRefreshPost: null,
  allFriendsCount: 0,
  sentFriendRequestCount: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setFriendList(state, action: PayloadAction<{ userId: string; action: "add" | "remove" }>) {
      const { userId, action: act } = action.payload;
      if (act === "add" && !state.friendIds.includes(userId)) {
        state.friendIds.push(userId);
      } else if (act === "remove") {
        state.friendIds = state.friendIds.filter(id => id !== userId);
      }
      return
    },
    setSentReqList(state, action: PayloadAction<{ userId: string; action: "add" | "remove" }>) {
      const { userId, action: act } = action.payload;
      if (act === "add" && !state.sentRequests.includes(userId)) {
        state.sentRequests.push(userId)
      } else if (act === "remove") {
        state.sentRequests = state.sentRequests.filter(id => id !== userId);
      }
      return
    },
    setReceivedReq(state, action: PayloadAction<{ userId: string; action: "add" | "remove" }>) {
      const { userId, action: act } = action.payload;
      if (act === "add" && !state.receiveReq.includes(userId)) {
        state.receiveReq.push(userId)
      } else if (act === "remove") {
        state.receiveReq = state.receiveReq.filter(id => id !== userId);
      }
      return
    },
    setBlockList(state, action: PayloadAction<{ userId: string; action: "add" | "remove" }>) {
      const { userId, action: act } = action.payload;
      if (!!state.blockedUsers) {
        if (act === "add" && !state.blockedUsers.includes(userId)) {
          state.blockedUsers.push(userId)
        } else if (act === "remove") {
          state.blockedUsers = state.blockedUsers.filter(id => id !== userId);
        }
      }
      return
    },
    setSavedList(state, action: PayloadAction<{ postId: string; action: "add" | "remove" }>) {
      const { postId, action: act } = action.payload;
      if (act === "add" && !state.savedPosts.includes(postId)) {
        state.savedPosts.push(postId)
      } else if (act === "remove") {
        state.savedPosts = state.savedPosts.filter(id => id !== postId);
      }
      return
    },
    setFavList(state, action: PayloadAction<{ postId: string; action: "add" | "remove" }>) {
      const { postId, action: act } = action.payload;
      if (act === "add" && !state.favorites.includes(postId)) {
        state.favorites.push(postId);
      } else if (act === "remove") {
        state.favorites = state.favorites.filter(id => id !== postId);
      }
    },

    setSentFriendRequestCount(state, action: PayloadAction<number>) {
      state.sentFriendRequestCount = action.payload;
    },
    setAllFriendsCount(state, action: PayloadAction<number>) {
      state.allFriendsCount = action.payload;
    },
    refreshStates() {
      localStorage.clear();
      location.reload();
    },
    setIsRefreshPost(state, action: PayloadAction<number | null>) {
      state.isRefreshPost = action.payload;
    },
    // addFriend(state, action: PayloadAction<string>) {
    //   if (!state.friendIds.includes(action.payload)) {
    //     state.friendIds.push(action.payload);
    //   }
    // },
    // removeFriend(state, action: PayloadAction<string>) {
    //   state.friendIds = state.friendIds.filter(id => id !== action.payload);
    // },
    // setSavedPosts(state, action: PayloadAction<Post[] | ActivityTypePost[]>) {
    //   state.savedPosts = action.payload.map(post => post?.postid);
    // },
  },
});

export const { setSavedList, setFavList, setFriendList, setReceivedReq, setSentReqList, setBlockList, refreshStates, setIsRefreshPost, setSentFriendRequestCount, setAllFriendsCount } = userSlice.actions;
export default userSlice.reducer;