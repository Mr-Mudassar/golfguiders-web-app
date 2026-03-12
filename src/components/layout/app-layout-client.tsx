'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Navbar, Sidebar } from '@/components/layout';
import { BackgroundEffects } from '@/components/layout/BackgroundEffects';

const NoInternetDialog = dynamic(
    () => import('@/components/layout/no-internet-dialog').then((mod) => mod.default),
    { ssr: false }
);
const NotificationsFirestoreListener = dynamic(
    () =>
        import('@/components/layout/notifications-firestore-listener').then((mod) => ({
            default: mod.NotificationsFirestoreListener,
        })),
    { ssr: false }
);
const BellNotificationsInitializer = dynamic(
    () =>
        import('@/components/layout/bell-notifications-initializer').then((mod) => ({
            default: mod.BellNotificationsInitializer,
        })),
    { ssr: false }
);
const FriendsCountInitializer = dynamic(
    () =>
        import('@/components/layout/friends-count-initializer').then((mod) => ({
            default: mod.FriendsCountInitializer,
        })),
    { ssr: false }
);

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-screen selection:bg-primary/30">
            <BackgroundEffects />
            <BellNotificationsInitializer />
            <FriendsCountInitializer />
            <NotificationsFirestoreListener />
            <Navbar />
            <Sidebar />
            <div className="md:pl-16 pt-16 min-h-screen">
                <div className="relative z-10">
                    {children}
                </div>
            </div>
            <NoInternetDialog />
        </main>
    );
}