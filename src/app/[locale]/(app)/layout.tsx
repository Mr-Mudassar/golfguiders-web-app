import React from 'react';
import type { Metadata } from 'next';
import { AppLayoutClient } from '@/components/layout/app-layout-client';

export const metadata: Metadata = {
  title: {
    template: '%s - GolfGuiders',
    absolute: 'Dashboard - GolfGuiders',
  },
};

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return <AppLayoutClient>{children}</AppLayoutClient>;
};

export default AppLayout;