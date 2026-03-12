'use client';

import React from 'react';

import { setupListeners } from '@reduxjs/toolkit/query';
import { Provider } from 'react-redux';

import { makeStore, type AppStore } from '@/lib/redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, type Persistor } from 'redux-persist';

interface Props {
  readonly children: React.ReactNode;
}

// Exported so logout can call persistor.purge()
export let appPersistor: Persistor | null = null;

export const StoreProvider = ({ children }: Props) => {
  const storeRef = React.useRef<AppStore | null>(null);
  const persistorRef = React.useRef<Persistor | null>(null);

  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }

  if (persistorRef.current === null) {
    persistorRef.current = persistStore(storeRef.current);
    appPersistor = persistorRef.current;
  }

  React.useEffect(() => {
    if (storeRef.current !== null) {
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  }, []);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  );
};
