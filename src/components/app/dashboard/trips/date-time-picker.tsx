'use client';

import React from 'react';
import { Calendar } from '@/components/ui';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  time: string; // HH:mm format (24h internally)
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  mode?: 'date' | 'time' | 'both';
}

/** Convert 24h hour to 12h display */
function to12h(h24: number): { hour12: string; period: 'AM' | 'PM' } {
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { hour12: h12.toString().padStart(2, '0'), period };
}

/** Convert 12h hour + period to 24h string */
function to24h(hour12: string, period: 'AM' | 'PM'): string {
  let h = parseInt(hour12, 10);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return h.toString().padStart(2, '0');
}

/** Format time for display: "06:10 AM" */
function formatTimeDisplay(h24: string, minute: string): string {
  const { hour12, period } = to12h(parseInt(h24, 10));
  return `${hour12}:${minute} ${period}`;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  onDateChange,
  time,
  onTimeChange,
  disabled = false,
  placeholder = 'Pick a date and time',
  className,
  mode,
}) => {
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [timeOpen, setTimeOpen] = React.useState(false);

  const hours12 = Array.from({ length: 12 }, (_, i) => {
    const h = i === 0 ? 12 : i;
    return h.toString().padStart(2, '0');
  });
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  // Internal state in 24h
  const [selectedHour, setSelectedHour] = React.useState<string>(
    time ? time.split(':')[0] || '00' : '00'
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    time ? time.split(':')[1] || '00' : '00'
  );
  const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>(() => {
    const h = parseInt(time ? time.split(':')[0] || '0' : '0', 10);
    return h >= 12 ? 'PM' : 'AM';
  });

  React.useEffect(() => {
    if (time) {
      const [hour, minute] = time.split(':');
      setSelectedHour(hour || '00');
      setSelectedMinute(minute || '00');
      const h = parseInt(hour || '0', 10);
      setSelectedPeriod(h >= 12 ? 'PM' : 'AM');
    } else {
      setSelectedHour('00');
      setSelectedMinute('00');
      setSelectedPeriod('AM');
    }
  }, [time]);

  // Derive 12h display value from 24h state
  const { hour12: displayHour } = to12h(parseInt(selectedHour, 10));

  const handleTimeChange = (hour12Val: string, minute: string, period: 'AM' | 'PM') => {
    const h24 = to24h(hour12Val, period);
    setSelectedHour(h24);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    onTimeChange(`${h24}:${minute}`);
  };

  const isDateOnly = mode === 'date' || (mode === undefined && onTimeChange.toString().includes('() => {}'));
  const isTimeOnly = mode === 'time' || (mode === undefined && onDateChange.toString().includes('() => {}'));

  const timePickerContent = (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Time</p>
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Hour</label>
          <Select
            value={displayHour}
            onValueChange={(value) => handleTimeChange(value, selectedMinute, selectedPeriod)}
          >
            <SelectTrigger className="w-[68px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] z-[100003]" style={{ zIndex: 100003 }}>
              {hours12.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xl font-medium text-muted-foreground pb-2">:</span>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Min</label>
          <Select
            value={selectedMinute}
            onValueChange={(value) => handleTimeChange(displayHour, value, selectedPeriod)}
          >
            <SelectTrigger className="w-[68px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] z-[100003]" style={{ zIndex: 100003 }}>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">&nbsp;</label>
          <div className="flex h-10 rounded-md border border-input overflow-hidden">
            <button
              type="button"
              className={cn(
                'px-2.5 text-xs font-semibold transition-colors',
                selectedPeriod === 'AM'
                  ? 'bg-primary text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              )}
              onClick={() => handleTimeChange(displayHour, selectedMinute, 'AM')}
            >
              AM
            </button>
            <button
              type="button"
              className={cn(
                'px-2.5 text-xs font-semibold transition-colors',
                selectedPeriod === 'PM'
                  ? 'bg-primary text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              )}
              onClick={() => handleTimeChange(displayHour, selectedMinute, 'PM')}
            >
              PM
            </button>
          </div>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        className="w-full"
        onClick={() => setTimeOpen(false)}
      >
        Confirm
      </Button>
    </div>
  );

  if (isDateOnly) {
    return (
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-10 px-3',
              !date && 'text-muted-foreground',
              className
            )}
          >
            <Icon name="calendar" className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{date ? format(date, 'PPP') : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-xl border rounded-lg"
          align="start"
          sideOffset={8}
          style={{ zIndex: 100002 }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setCalendarOpen(false);
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (isTimeOnly) {
    return (
      <Popover open={timeOpen} onOpenChange={setTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-10 px-3',
              !time && 'text-muted-foreground',
              className
            )}
          >
            <Icon name="clock" className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span>{time ? formatTimeDisplay(selectedHour, selectedMinute) : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-4 shadow-xl border rounded-lg"
          align="start"
          sideOffset={8}
          style={{ zIndex: 100002 }}
        >
          {timePickerContent}
        </PopoverContent>
      </Popover>
    );
  }

  // Combined date and time picker
  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-10 px-3',
              !date && 'text-muted-foreground'
            )}
          >
            <Icon name="calendar" className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{date ? format(date, 'PPP') : 'Pick a date'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-xl border rounded-lg"
          align="start"
          sideOffset={8}
          style={{ zIndex: 100002 }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setCalendarOpen(false);
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover open={timeOpen} onOpenChange={setTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-10 px-3',
              !time && 'text-muted-foreground'
            )}
          >
            <Icon name="clock" className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span>{time ? formatTimeDisplay(selectedHour, selectedMinute) : '--:--'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-4 shadow-xl border rounded-lg"
          align="start"
          sideOffset={8}
          style={{ zIndex: 100002 }}
        >
          {timePickerContent}
        </PopoverContent>
      </Popover>
    </div>
  );
};
