// hooks/useLogoutCheck.ts
// This goes in both app.example.com and store.example.com projects
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ReduxStore {
    dispatch: (action: { type: string; payload?: unknown }) => void;
    getState: () => Record<string, unknown>;
}

interface WindowWithStore extends Window {
    store?: ReduxStore;
}

export const useLogoutCheck = () => {
    const router = useRouter();

    useEffect(() => {
        // Check if user should be logged out (e.g., from URL params or storage)
        const urlParams = new URLSearchParams(window.location.search);
        const shouldLogout = urlParams.get('logout') === 'true';

        if (shouldLogout) {
            // Clear Redux state
            if (typeof window !== 'undefined') {
                const windowWithStore = window as WindowWithStore;
                if (windowWithStore.store) {
                    windowWithStore.store.dispatch({ type: 'RESET_ALL_STATE' });
                }
            }

            // Clear local storage
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (error) {
                console.error('Error clearing browser storage:', error);
            }

            // Clear cookies
            try {
                document.cookie.split(';').forEach(cookie => {
                    const eqPos = cookie.indexOf('=');
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                    // Clear for current domain and parent domain
                    document.cookie = `${name}=; expires = Thu, 01 Jan 1970 00:00:00 GMT; path =/`;
                    document.cookie = `${name}=; expires = Thu, 01 Jan 1970 00:00:00 GMT; path =/;domain=.example.com`;
                });
            } catch (error) {
                console.error('Error clearing cookies:', error);
            }

            // Redirect to login page
            router.push('/login?message=session_expired');
        }
    }, [router]);
};