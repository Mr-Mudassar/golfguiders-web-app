'use client';

import { RestrictedForWeb } from '@/components/common';
import React from 'react';

const TournamentContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Check the initial window size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <RestrictedForWeb />;
  }

  return children;
};

export { TournamentContainer };
