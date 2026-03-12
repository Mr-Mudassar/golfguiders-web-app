import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Icon, type IconProps } from './icon';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number | string | undefined;
  icon?: IconProps['name'];
  iconSize?: IconProps['size'];
  iconClassName?: string;
  onIconClick?: () => void;
  wrapperClassName?: string;
  isErrored?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      min,
      type,
      icon,
      className,
      isErrored,
      onIconClick,
      iconSize = 20,
      iconClassName,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative', wrapperClassName)}>
          <input
            type={type}
            className={cn(
              `flex h-10 w-full ${!className?.includes('rounded-') && 'rounded-lg'} border border-border/50 bg-background px-4 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/40 hover:border-border disabled:cursor-not-allowed disabled:opacity-50`,
              icon && 'pr-10',
              isErrored && 'border-destructive focus-visible:ring-destructive/30',
              className
            )}

          min={min}
          ref={ref}
          {...props}
        />
        {icon && (
          <Slot
            className={cn(
              'absolute right-3 inset-y-0 translate-y-[43%] text-muted-foreground',
              onIconClick && 'cursor-pointer',
              isErrored && 'text-destructive',
              iconClassName
            )}
            aria-hidden="true"
            onClick={onIconClick}
          >
            <Icon name={icon} size={iconSize} />
          </Slot>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
