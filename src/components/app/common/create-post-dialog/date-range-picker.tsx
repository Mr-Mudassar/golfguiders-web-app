'use client';

import { Button, Calendar, Icon } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { PostInputType } from '.';

/** Parse date_from/date_to from API: numeric timestamp (string/number) or ISO string. Returns valid Date or undefined. */
function parseDateFrom(value: string | number | undefined): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(num)) {
    const d = new Date(num);
    return Number.isFinite(d.getTime()) ? d : undefined;
  }
  if (typeof value === 'string' && value.length > 0) {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : undefined;
  }
  return undefined;
}

function isValidDate(d: Date | undefined): d is Date {
  return d != null && Number.isFinite(d.getTime());
}

interface DateTimeRangePickerProps {
  className?: string;
  postCase?: string;
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  className,
  postCase = 'create',
}) => {
  const form = useFormContext<PostInputType>();
  const date_from = form.watch('date_from');
  const error =
    form.formState.errors.date_from || form.formState.errors.date_to;

  const parsedFrom = React.useMemo(
    () => (postCase === 'edit' && date_from ? parseDateFrom(date_from) : undefined),
    [postCase, date_from]
  );

  const [startDate, setStartDate] = React.useState<Date | undefined>(() => parsedFrom);
  const [startTime, setStartTime] = React.useState<{
    hours: string;
    minutes: string;
    period: 'AM' | 'PM';
  }>(() => {
    if (postCase !== 'edit' || !parsedFrom || !isValidDate(parsedFrom))
      return { hours: '', minutes: '', period: 'AM' as const };
    const h = parsedFrom.getHours();
    const m = parsedFrom.getMinutes();
    return {
      hours: (h % 12 || 12).toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      period: h >= 12 ? 'PM' : 'AM',
    };
  });

  // Sync from form when opening edit (date_from can arrive after first render).
  // Only set state when the parsed value actually differs to avoid form↔state update loop.
  const prevParsedFromRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (postCase !== 'edit' || !date_from) {
      prevParsedFromRef.current = null;
      return;
    }
    const next = parseDateFrom(date_from);
    if (!isValidDate(next)) return;
    const key = `${next.getTime()}-${next.getHours()}-${next.getMinutes()}`;
    if (prevParsedFromRef.current === key) return;
    prevParsedFromRef.current = key;
    setStartDate(next);
    setStartTime({
      hours: (next.getHours() % 12 || 12).toString().padStart(2, '0'),
      minutes: next.getMinutes().toString().padStart(2, '0'),
      period: next.getHours() >= 12 ? 'PM' : 'AM',
    });
  }, [postCase, date_from]);

  // Generate options for dropdowns
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) =>
      (i + start).toString().padStart(2, '0')
    );
  const hoursOptions = range(1, 12);
  const minutesOptions = range(0, 59);

  // Calculate end date and time (6 hours after start). Use 0 for seconds/ms so output is stable.
  const calculateEndDateTime = (
    start: Date | undefined,
    time: { hours: string; minutes: string; period: 'AM' | 'PM' }
  ): Date | undefined => {
    if (!start || !isValidDate(start)) return undefined;
    const endDate = new Date(start);
    let hours = parseInt(time.hours, 10);
    const minutes = parseInt(time.minutes, 10);
    if (time.period === 'PM' && hours !== 12) hours += 12;
    if (time.period === 'AM' && hours === 12) hours = 0;
    endDate.setHours(hours, minutes, 0, 0);
    endDate.setHours(endDate.getHours() + 6);
    return endDate;
  };

  // Validate that the selected time is not before the current time
  // If the selected date is today, the time must be in the future
  const isTimeBeforeCurrent = (
    date: Date,
    time: { hours: string; minutes: string; period: 'AM' | 'PM' }
  ) => {
    if (!isValidDate(date)) return false;
    const now = new Date();
    const selectedDate = new Date(date);
    let hours = parseInt(time.hours, 10);
    if (time.period === 'PM' && hours !== 12) hours += 12;
    if (time.period === 'AM' && hours === 12) hours = 0;
    selectedDate.setHours(
      hours,
      time.minutes ? parseInt(time.minutes, 10) : 0,
      0,
      0
    );

    // Check if the selected date is today
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    // If it's today, check if the time is before current time
    if (isToday) {
      return selectedDate < now;
    }

    // If it's a future date, allow any time
    // If it's a past date, allow any time (as per previous requirement)
    return false;
  };

  // Update form values when start date or time changes. Use 0 for seconds/ms so the
  // written ISO is stable and doesn't keep changing (which would retrigger sync effect).
  const formEffectDeps = [
    startDate?.getTime(),
    startTime.hours,
    startTime.minutes,
    startTime.period,
    postCase,
  ];
  const prevFormValuesRef = React.useRef<{ from?: string; to?: string } | null>(null);
  React.useEffect(() => {
    if (!startDate || !startTime.hours || !startTime.minutes || !startTime.period || !isValidDate(startDate)) {
      if (prevFormValuesRef.current !== null) {
        prevFormValuesRef.current = null;
        form.setValue('date_from', undefined, { shouldValidate: true });
        form.setValue('date_to', undefined, { shouldValidate: true });
      }
      return;
    }

    const startDateTime = new Date(startDate);
    let hours = parseInt(startTime.hours, 10);
    const minutes = parseInt(startTime.minutes, 10);
    if (startTime.period === 'PM' && hours !== 12) hours += 12;
    if (startTime.period === 'AM' && hours === 12) hours = 0;
    startDateTime.setHours(hours, minutes, 0, 0);

    if (postCase === 'create' && isTimeBeforeCurrent(startDate, startTime)) {
      form.setError('date_from', {
        type: 'manual',
        message: 'Cannot select a time before the current time',
      });
      form.setValue('date_from', undefined, { shouldValidate: true });
      form.setValue('date_to', undefined, { shouldValidate: true });
      // Reset time to current time so dropdowns only allow future times
      const now = new Date();
      setStartTime({
        hours: (now.getHours() % 12 || 12).toString().padStart(2, '0'),
        minutes: now.getMinutes().toString().padStart(2, '0'),
        period: now.getHours() >= 12 ? 'PM' : 'AM',
      });
      return;
    }

    const endDateTime = calculateEndDateTime(startDate, startTime);
    const fromIso = startDateTime.toISOString();
    const toIso = endDateTime && isValidDate(endDateTime) ? endDateTime.toISOString() : undefined;
    if (prevFormValuesRef.current?.from === fromIso && prevFormValuesRef.current?.to === toIso) return;
    prevFormValuesRef.current = { from: fromIso, to: toIso ?? undefined };

    form.setValue('date_from', fromIso, { shouldValidate: true });
    form.setValue('date_to', toIso ?? undefined, { shouldValidate: true });
    form.clearErrors('date_from');
    form.clearErrors('date_to');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, formEffectDeps);

  // Check if selected date is today
  const isSelectedDateToday = React.useMemo(() => {
    if (!startDate || !isValidDate(startDate)) return false;
    const today = new Date();
    return (
      startDate.getFullYear() === today.getFullYear() &&
      startDate.getMonth() === today.getMonth() &&
      startDate.getDate() === today.getDate()
    );
  }, [startDate]);

  // Get current time for filtering past times when today is selected
  const currentTime = React.useMemo(() => {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
    };
  }, []);

  // When today is selected in create mode and it's afternoon, default period to PM so hour dropdown isn't empty
  React.useEffect(() => {
    if (postCase !== 'create' || !isSelectedDateToday || startTime.hours !== '') return;
    const now = new Date();
    if (now.getHours() >= 12 && startTime.period === 'AM') {
      setStartTime((prev) => ({ ...prev, period: 'PM' }));
    }
  }, [postCase, isSelectedDateToday, startTime.hours, startTime.period]);

  // Filter time options based on whether today is selected
  const getFilteredHours = () => {
    if (!isSelectedDateToday || postCase !== 'create') {
      return hoursOptions;
    }
    return hoursOptions.filter((hour) => {
      const hourNum = parseInt(hour, 10);

      // Convert to 24-hour for comparison
      let hour24 = hourNum;
      if (startTime.period === 'PM' && hourNum !== 12) hour24 += 12;
      if (startTime.period === 'AM' && hourNum === 12) hour24 = 0;

      // If selected hour is in the future, allow it
      if (hour24 > currentTime.hours) {
        return true;
      }
      // If selected hour is current hour, check minutes (will be handled in minutes filter)
      if (hour24 === currentTime.hours) {
        return true; // Allow it, minutes will be filtered
      }
      // If selected hour is in the past, disallow
      return false;
    });
  };

  const getFilteredMinutes = (selectedHour: string) => {
    if (!isSelectedDateToday || postCase !== 'create' || !selectedHour) {
      return minutesOptions;
    }

    const hourNum = parseInt(selectedHour, 10);
    let selectedHour24 = hourNum;
    if (startTime.period === 'PM' && hourNum !== 12) selectedHour24 += 12;
    if (startTime.period === 'AM' && hourNum === 12) selectedHour24 = 0;

    // If selected hour is in the future, allow all minutes
    if (selectedHour24 > currentTime.hours) {
      return minutesOptions;
    }
    // If selected hour is current hour, filter past minutes
    if (selectedHour24 === currentTime.hours) {
      return minutesOptions.filter((min) => parseInt(min, 10) >= currentTime.minutes);
    }
    // If selected hour is in the past, return empty (shouldn't happen due to hour filtering)
    return [];
  };

  // Handle time dropdown changes
  const handleTimeChange = (field: keyof typeof startTime, value: string) => {
    setStartTime((prev) => ({ ...prev, [field]: value }));
    form.clearErrors('date_from'); // Clear error when user starts editing
  };

  // Format date-time for display (excluding seconds and milliseconds)
  const formatDateTime = (date: Date | undefined): string => {
    if (!date || !isValidDate(date)) return 'Not selected';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-time"
            variant={'ghost'}
            size="icon"
            isErrored={
              !!(
                form.formState.errors.date_from || form.formState.errors.date_to
              )
            }
            tooltip="Select date and time"
            className="shadow-sm hover:bg-accent/50 transition-colors duration-200"
          >
            <Icon
              name="calendar"
              size={16}
              color={startDate ? 'hsl(var(--primary))' : 'currentColor'}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="rounded-lg border bg-popover text-popover-foreground shadow-lg outline-none w-auto p-3 min-w-[20rem] max-w-xs"
          align="center"
          side="top"
          style={{ zIndex: 10002 }}
        >
          <div className="space-y-4">
            {/* Date Picker */}
            <Calendar
              mode="single"
              selected={isValidDate(startDate) ? startDate : undefined}
              onSelect={setStartDate}
              defaultMonth={isValidDate(startDate) ? startDate : undefined}
              fromDate={postCase === 'create' ? new Date() : undefined}
              disabled={
                postCase === 'create'
                  ? {
                    before: (() => {
                      const d = new Date();
                      d.setHours(0, 0, 0, 0);
                      return d;
                    })()
                  }
                  : undefined
              }
              className="rounded-lg border border-input overflow-hidden"
            />
            {/* Time Picker */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">
                Start Time <span className='text-red-600'>*</span>
              </label>
              <div className="flex gap-2 items-center">
                <Select
                  value={startTime.hours}
                  onValueChange={(value) => handleTimeChange('hours', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent className="z-10010">
                    {getFilteredHours().map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground self-center">
                  :
                </span>
                <Select
                  value={startTime.minutes}
                  onValueChange={(value) => handleTimeChange('minutes', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent className="z-10010">
                    {getFilteredMinutes(startTime.hours).map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={startTime.period}
                  onValueChange={(value) =>
                    handleTimeChange('period', value as 'AM' | 'PM')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-10010">
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Display end time */}
            <div className="space-y-2">
              <p>
                <div className="text-sm font-medium text-foreground mb-2">
                  End Time <span className='text-xs text-muted-foreground'>(Auto Selected)</span>
                </div>
                <div className={`text-sm p-2 w-full border shadow rounded-md ${!startDate && "text-muted-foreground"}`}>
                  {startDate &&
                    startTime.hours &&
                    startTime.minutes &&
                    startTime.period
                    ? formatDateTime(calculateEndDateTime(startDate, startTime))
                    : 'Not selected yet'}
                </div>
              </p>
            </div>
            {/* Error Message */}
            {error && (
              <p className="text-destructive text-center text-sm mt-2">
                {error?.message}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { DateTimeRangePicker };
