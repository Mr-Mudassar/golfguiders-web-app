'use client';

import { ApolloClientProvider } from './apollo';
import { StoreProvider } from './store';
import { ReactQueryClientProvider } from './react-query';
import { useAuth } from '@/lib';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ApolloClientProvider>
        <ReactQueryClientProvider>
            <StoreProvider>
            <AuthInitializer />
            {children}
          </StoreProvider>
      </ReactQueryClientProvider>
    </ApolloClientProvider>
  );
}

function AuthInitializer() {
  useAuth();
  return null;
}
