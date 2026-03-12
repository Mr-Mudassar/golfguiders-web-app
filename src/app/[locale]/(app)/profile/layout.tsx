import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Profile',
};

const ProfileLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

export default ProfileLayout;
