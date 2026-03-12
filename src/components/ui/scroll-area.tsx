'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '@/lib/utils';

/** Ref not forwarded to avoid Radix compose-refs setState loop (max update depth). */
const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, _ref) => {
  const { ref: _refProp, ...rest } = props as React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.Root
  > & { ref?: React.Ref<unknown> };
  return (
  <ScrollAreaPrimitive.Root
    className={cn('relative overflow-hidden', className)}
    {...rest}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

/** Ref not forwarded to avoid Radix compose-refs setState loop (max update depth). */
const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, _ref) => {
  const { ref: _refProp, ...rest } = props as React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > & { ref?: React.Ref<unknown> };
  return (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
      'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
      'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...rest}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
