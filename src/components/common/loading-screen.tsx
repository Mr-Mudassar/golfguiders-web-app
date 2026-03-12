import { cn } from '@/lib/utils';
import React from 'react';
import { Loading } from './loading';

interface LoadingScreenProps {
  loadingIconSize?: number;
  className?: string;
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  loadingIconSize = 32,
  className,
  text = 'Loading...',
}) => {
  return (
    <div
      className={cn(
        'h-screen w-full flex flex-col justify-center items-center bg-background text-foreground',
        className
      )}
    >
      <Loading iconSize={loadingIconSize} />
      <p className="font-medium text-lg mt-2">{text}</p>
    </div>
  );
};

export { LoadingScreen };
