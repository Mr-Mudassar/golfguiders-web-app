import { cn } from '@/lib/utils';
import React from 'react';

interface ContainerProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ className, children }) => {
  return (
    <div className={cn('container px-4 lg:px-8', className)}>{children}</div>
  );
};

export { Container };
