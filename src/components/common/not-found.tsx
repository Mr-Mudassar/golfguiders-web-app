import { cn } from '@/lib/utils';
import React from 'react';

interface NotFoundProps {
  className?: string;
  errorDescription?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ className, errorDescription }) => {
  return (
    <section
      className={cn(
        'min-h-[60vh] flex items-center justify-center flex-col text-center',
        className
      )}
    >
      <h1 className="text-3xl font-semibold">Not Found!</h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        {errorDescription || 'The page you are looking for is not found!'}
      </p>
    </section>
  );
};

export { NotFound };
