'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Icon } from './icon';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Theme overrides: use app primary (green) + fit calendar + rounded selected date */
const RDP_THEME_STYLES = `
  .rdp-theme.rdp-root {
    --rdp-accent-color: hsl(var(--primary));
    --rdp-accent-background-color: hsl(var(--primary) / 0.2);
    --rdp-today-color: hsl(var(--primary));
    --rdp-selected-border: 1px solid hsl(var(--primary));
    --rdp-range_start-date-background-color: hsl(var(--primary));
    --rdp-range_end-date-background-color: hsl(var(--primary));
    --rdp-range_middle-background-color: hsl(var(--primary) / 0.15);
    --rdp-day_button-border-radius: 9999px;
    /* Slightly smaller cells so 7 columns fit inside the popover without overflow */
    --rdp-day-width: 2.7rem;
    --rdp-day-height: 2.2rem;
    --rdp-day_button-width: 2.2rem;
    --rdp-day_button-height: 2.2rem;
  }
  .rdp-theme .rdp-chevron {
    fill: hsl(var(--primary));
  }
  .rdp-theme .rdp-day_button {
    border-radius: 9999px;
  }
  .rdp-theme .rdp-today:not(.rdp-outside) {
    color: hsl(var(--primary));
    font-weight: 400;
  }
  .rdp-theme .rdp-selected .rdp-day_button {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border-color: hsl(var(--primary));
    border-radius: 9999px;
  }
`;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RDP_THEME_STYLES }} />
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('rdp-theme p-3', className)}
        classNames={{
          root: 'rdp-root',
          day_button: cn(
            buttonVariants({ variant: 'ghost' }),
            'rdp-day_button h-7 w-7 p-0 font-normal aria-selected:opacity-100 text-sm!'
          ),
          selected:
            'rdp-selected rounded-full!',
          today: 'rdp-today text-primary font-semibold',
          outside: 'rdp-outside text-muted-foreground opacity-75',
          disabled: 'rdp-disabled text-muted-foreground opacity-50',
          ...classNames,
        }}
        components={{
          Chevron: (chevronProps) =>
            chevronProps.orientation === 'left' ? (
              <Icon name="chevron-left" className="h-4 w-4 text-primary" />
            ) : (
              <Icon name="chevron-right" className="h-4 w-4 text-primary" />
            ),
        }}
        {...props}
      />
    </>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
