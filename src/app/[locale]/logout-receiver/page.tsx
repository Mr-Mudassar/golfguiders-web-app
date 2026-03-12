'use client';

import { useEffect } from 'react';
import type {
  CrossDomainMessage,
  LogoutCompletePayload,
} from '@/lib/types/auth';

interface ReduxStore {
  dispatch: (action: { type: string; payload?: unknown }) => void;
  getState: () => Record<string, unknown>;
}

interface WindowWithStore extends Window {
  store?: ReduxStore;
}

export default function LogoutReceiver() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent<CrossDomainMessage>) => {
      // Only accept messages from auth domain
      const authDomain =
        process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.example.com';

      if (event.origin !== authDomain) {
        console.warn('Unauthorized logout message from:', event.origin);
        return;
      }

      if (event.data.type === 'LOGOUT_REQUEST') {
        try {
          console.log('Received logout request from auth domain');

          // Clear Redux state
          if (typeof window !== 'undefined') {
            const windowWithStore = window as WindowWithStore;
            if (windowWithStore.store) {
              windowWithStore.store.dispatch({ type: 'RESET_ALL_STATE' });
            }
          }

          // Clear browser storage
          localStorage.clear();
          sessionStorage.clear();

          // Clear cookies
          document.cookie.split(';').forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name =
              eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

            // Clear for current domain and parent domain
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = ` ${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.example.com`;
          });

          // Prepare completion payload
          const completionPayload: LogoutCompletePayload = {
            domain: window.location.origin,
            timestamp: Date.now(),
          };

          // Send completion message back to auth domain
          if (event.source && 'postMessage' in event.source) {
            const messageSource = event.source as MessageEventSource;
            messageSource.postMessage(
              {
                type: 'LOGOUT_COMPLETE',
                payload: completionPayload,
              },
              { targetOrigin: event.origin }
            );
          }

          console.log('Logout completed for domain:', window.location.origin);
        } catch (error) {
          console.error('Error during logout receiver:', error);

          // Prepare error payload
          const errorPayload: LogoutCompletePayload = {
            domain: window.location.origin,
            timestamp: Date.now(),
            error: error instanceof Error ? error.message : 'Unknown error',
          };

          // Still send completion message even if there were errors
          if (event.source && 'postMessage' in event.source) {
            const messageSource = event.source as MessageEventSource;
            messageSource.postMessage(
              {
                type: 'LOGOUT_COMPLETE',
                payload: errorPayload,
              },
              { targetOrigin: event.origin }
            );
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <p>Logout receiver - processing cross-domain logout...</p>
    </div>
  );
}
