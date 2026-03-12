'use client';

import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button, Input, Icon, Label } from '@/components/ui';
import type { DateRange } from 'react-day-picker';

// type Range = {
//   from: Date;
//   to: Date;
// };

export const DateRangeFilter = ({
  setDate,
  close,
}: {
  setDate: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  close: () => void;
}) => {
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: today,
  });

  const apply = () => {
    if (!range?.from || !range?.to) return;

    setDate({
      start: format(range?.from, 'yyyy-MM-dd'),
      end: format(range?.to, 'yyyy-MM-dd'),
    });

    setOpen(false);
    close();
  };

  const clear = () => {
    setRange({
      from: startOfMonth(today),
      to: today,
    });

    setDate({
      start: format(startOfMonth(today), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    });

    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Inputs */}
      <div className="grid gap-2 items-center">
        <div className="flex items-center gap-2">
          <Label className="min-w-20">Start Date:</Label>
          <Input
            disabled
            value={range?.from ? format(range?.from, 'dd MMM yyyy') : ''}
            placeholder="Start date"
          />
          <Icon
            name="calendar"
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="min-w-20">End Date: </Label>
          <Input
            disabled
            value={range?.to ? format(range?.to, 'dd MMM yyyy') : ''}
            placeholder="End date"
          />
          <Icon
            name="calendar"
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            name="close"
            className="cursor-pointer text-muted-foreground"
            onClick={clear}
            size="sm"
            variant="outline"
          >
            Clear
          </Button>
          <Button size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {open && (
        <div className="absolute top-0 -right-40 z-50 mt-2 rounded border bg-background">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            disabled={(date) => (range?.from ? date < range?.from : false)}
          />
        </div>
      )}
      {/* <div className="flex justify-end gap-2 p-2 border-t">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={apply}>
          Apply
        </Button>
      </div> */}
    </div>
  );
};
