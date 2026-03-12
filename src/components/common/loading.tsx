import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import React from 'react';

interface LoadingProps {
  readonly className?: string;
  iconSize?: number;
  iconColor?: string;
}

const Loading: React.FC<LoadingProps> = ({
  className,
  iconSize = 20,
  iconColor = 'muted',
}) => {


  return (
    <div className={cn('flex items-center justify-center w-full', className)}>
      <Loader className={`animate-spin ${iconColor}`} size={iconSize} />
    </div>
  );
};

export { Loading };
