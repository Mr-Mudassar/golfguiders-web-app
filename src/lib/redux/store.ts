import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from './storage';

import authReducer from './slices/auth';
import userReducer from './slices/user';
import leagueReducer from './slices/leagues';
import notificationsReducer from './slices/notifications';

// Combine all slices into a single rootReducer
const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  leagues: leagueReducer,
  notifications: notificationsReducer,
});

// Wrap with a root reducer that resets ALL state on RESET_ALL_STATE
const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === 'RESET_ALL_STATE') {
    // Pass undefined to get all slices back to their initialState
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['auth', 'user', 'leagues', 'notifications'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PURGE',
            'persist/FLUSH',
            'persist/REGISTER',
            'persist/PAUSE',
          ],
        },
      }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
