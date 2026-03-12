'use client';

import * as React from 'react';
import { format, isValid as isValidDate } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, Clock } from 'lucide-react';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';
import { Button } from './button';

/* ─── Inline Select (portal-free, works inside Sheet) ─── */

function InlineSelect({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [open]);

  // Scroll to selected item when dropdown opens
  React.useEffect(() => {
    if (open && listRef.current && value) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }, [open, value]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? '';

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 text-sm font-medium transition-all',
          'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30',
          open && 'ring-2 ring-primary/30 border-primary/50',
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full z-[1000] mt-1 max-h-44 overflow-y-auto rounded-lg border border-border/40 bg-popover py-1 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                data-selected={isActive}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted/60',
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── DateTimePicker ─── */

interface DateTimePickerProps {
  value?: string; // "yyyy-MM-dd'T'HH:mm" format
  onChange?: (value: string) => void;
  min?: string; // "yyyy-MM-dd'T'HH:mm" or "yyyy-MM-dd"
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  min,
  className,
  placeholder = 'Pick date & time',
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value) : undefined;
  const isValidParsed = parsed && isValidDate(parsed);

  const hours = isValidParsed ? parsed.getHours() : 12;
  const minutes = isValidParsed ? parsed.getMinutes() : 0;
  const isPM = hours >= 12;
  const display12h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  const minDt = min ? new Date(min) : undefined;
  const minDateOnly = minDt && isValidDate(minDt) ? new Date(minDt.getFullYear(), minDt.getMonth(), minDt.getDate()) : undefined;

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [open]);

  const updateDateTime = (date: Date, h: number, m: number) => {
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    onChange?.(format(d, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    updateDateTime(day, hours, minutes);
  };

  const handleHourChange = (h12Str: string) => {
    const h12 = Number(h12Str);
    const h24 = isPM ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12;
    if (isValidParsed) updateDateTime(parsed, h24, minutes);
  };

  const handleMinuteChange = (mStr: string) => {
    if (isValidParsed) updateDateTime(parsed, hours, Number(mStr));
  };

  const handlePeriodChange = (period: string) => {
    if (!isValidParsed) return;
    const wantPM = period === 'PM';
    if (wantPM === isPM) return;
    const newHours = wantPM ? hours + 12 : hours - 12;
    updateDateTime(parsed, newHours, minutes);
  };

  // Build options
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: String(i + 1),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: String(i),
  }));

  const periodOptions = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 w-full h-10 px-3 rounded-xl border border-border/60 bg-muted/30 text-sm text-left transition-colors',
          'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
          !isValidParsed && 'text-muted-foreground',
          disabled && 'opacity-60 cursor-not-allowed',
          open && 'ring-2 ring-primary/30 border-primary/50',
          className,
        )}
      >
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 truncate">
          {isValidParsed ? format(parsed, 'MMM d, yyyy · h:mm a') : placeholder}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-[999] mt-1.5 w-full max-w-75! rounded-xl border border-border/40 bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={isValidParsed ? parsed : undefined}
              onSelect={handleDateSelect}
              disabled={
                minDateOnly
                  ? (date) => date < minDateOnly
                  : undefined
              }
              className="p-0"
            />

            {/* Time picker */}
            <div className="border-t border-border/40 pt-3 mt-2 max-w-75!">
              <div className="flex items-center gap-2 justify-center mb-2.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Time
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2">
                {/* Hour */}
                <InlineSelect
                  value={String(display12h)}
                  options={hourOptions}
                  onChange={handleHourChange}
                  placeholder="HH"
                />

                <span className="text-lg font-bold text-muted-foreground text-center">:</span>

                {/* Minute */}
                <InlineSelect
                  value={String(minutes)}
                  options={minuteOptions}
                  onChange={handleMinuteChange}
                  placeholder="MM"
                />

                {/* AM / PM */}
                <InlineSelect
                  value={isPM ? 'PM' : 'AM'}
                  options={periodOptions}
                  onChange={handlePeriodChange}
                />
              </div>
            </div>

            {/* Done button */}
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 px-4 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
