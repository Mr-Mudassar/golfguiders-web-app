'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { Logo } from '@/components/common';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('App error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Logo className="h-10 mb-6 text-primary" />
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          We encountered an error. Please try again.
        </p>
        <Button onClick={reset} variant="default" className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
