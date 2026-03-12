'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  index?: number;
  children: React.ReactNode;
}

/**
 * AnimatedCard - Wraps content with smooth fade-in and slide-up animation
 * Uses CSS-only animation with staggered delay (no JS timers / state updates).
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  index = 0,
  ...props
}) => {
  const animationDelay = delay || index * 50; // 50ms stagger per item

  return (
    <div
      className={cn(
        'animate-card-enter',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

export { AnimatedCard };
