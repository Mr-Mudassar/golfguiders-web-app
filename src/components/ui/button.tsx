import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Loading } from '../common';
import { Tooltip } from './tooltip';
import { Icon } from './icon';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:bg-primary/90 hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-200',
        destructive:
          'bg-destructive text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-destructive/90 hover:shadow-[0_2px_3px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all duration-200',
        outline:
          'border border-border/60 bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-border active:scale-[0.98] transition-all duration-200',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-secondary/80 hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] active:scale-[0.98]',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
      },

      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-3',
        xl: 'h-10 rounded-md px-4 text-base',
        icon: 'h-9 aspect-square',
        'icon-sm': 'h-7 w-7',
        link: 'h-fit px-2 py-0.5 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loaderSize?: number;
  count?: number;
  loaderColor?: string;
  tooltip?: string;
  isErrored?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loaderSize = 20,
      loaderColor = "muted",
      count,
      tooltip,
      isErrored,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    let buttonChildren = props.children;

    if (loading) {
      props.disabled = true;
      // Use darker color for loader on primary buttons (especially in dark mode)
      // Ensure variant is not null before passing to Loading component
      buttonChildren = (
        <>
          {size !== 'icon' && size !== 'icon-sm' && (
            <span className="mr-2">{props.children}</span>
          )}
          <Loading
            className="w-fit"
            iconSize={loaderSize}
            iconColor={loaderColor}
          />
        </>
      );
    }

    if (count) {
      buttonChildren = (
        <>
          <span>{buttonChildren}</span>
          <span className="rounded-full bg-primary text-primary-foreground px-1 absolute -top-1 -right-1 text-[10px] leading-snug">
            {count}
          </span>
        </>
      );
    }

    const buttonComponent = (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isErrored && 'text-destructive border border-destructive'
        )}
        ref={ref}
        {...props}
      >
        {buttonChildren}
      </Comp>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{buttonComponent}</Tooltip>;
    }

    return buttonComponent;
  }
);

const EmojiReactionButton = ({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: (emoji: string) => void;
}) => {
  const [isClicked, setIsClicked] = React.useState<boolean>(false);

  // const handleClick = () => {
  //   setIsClicked(true);
  //   // Reset after animation completes (150ms)
  //   setTimeout(() => setIsClicked(false), 150);
  //   onClick(emoji);
  // };

  const [bubbles, setBubbles] = React.useState<number[]>([]);

  const handleClick = () => {
    const id = Date.now();
    setBubbles((prev) => [...prev, id]);
    setIsClicked(true);

    setTimeout(() => setIsClicked(false), 150);
    // Remove bubble after 1 second
    setTimeout(() => {
      setBubbles((prev) => prev.filter((bubbleId) => bubbleId !== id));
    }, 1000);
    onClick(emoji);
  };

  return (
    <div className="relative flex justify-center items-center">
      {/* Bubble elements */}
      {bubbles.map((id) => (
        <span
          key={id}
          className="absolute text-2xl animate-bubble pointer-events-none select-none"
        >
          {emoji}
        </span>
      ))}

      {/* Button */}
      {label === 'Heart' ? (
        <button
          type="button"
          title={label}
          onClick={handleClick}
          className={`text-white bg-red-600 hover:bg-red-700 transition-transform duration-150 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full text-sm h-9 w-9 text-center flex flex-col justify-center items-center`}
        >
          <Icon name="heart" size={20} className="fill-white" />
        </button>
      ) : label === 'Like' ? (
        <button
          type="button"
          className={`text-white bg-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm h-9 w-9 text-center flex flex-col justify-center items-center`}
          onClick={handleClick}
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 18"
          >
            <path d="M3 7H1a1 1 0 0 0-1 1v8a2 2 0 0 0 4 0V8a1 1 0 0 0-1-1Zm12.954 0H12l1.558-4.5a1.778 1.778 0 0 0-3.331-1.06A24.859 24.859 0 0 1 6 6.8v9.586h.114C8.223 16.969 11.015 18 13.6 18c1.4 0 1.592-.526 1.88-1.317l2.354-7A2 2 0 0 0 15.954 7Z" />
          </svg>
          <span className="sr-only">Icon description</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`text-white focus:outline-none font-medium h-9 w-9 text-center flex flex-col justify-center items-center transition-transform duration-150 ${isClicked ? 'scale-125' : 'scale-100'
            }`}
        >
          <span className="text-4xl">{emoji}</span>
          <span className="sr-only">{label}</span>
        </button>
      )}
    </div>
  );
};

Button.displayName = 'Button';

export { Button, buttonVariants, EmojiReactionButton };
