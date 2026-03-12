import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { TournamentFormValues } from '../';
import { format, addMinutes, isValid as isValidDate, isAfter, differenceInHours } from 'date-fns';
import { Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Fixed gap between each round start: 4 hours 30 minutes */
const ROUND_GAP_MINUTES = 4 * 60 + 30;

export function RoundsForm({ setValid }: { setValid: (b: boolean) => void }) {
  const { control, setValue } = useFormContext<TournamentFormValues>();

  const [roundsString, startTime, endTime, roundTimesWatched] = useWatch({
    control,
    name: ['rounds', 'start_time', 'end_time', 'rounds_times'],
  });

  const rounds = Number(roundsString) || 1;
  const maxRounds = 18;
  const totalSlots = Math.min(rounds, maxRounds);
  const automate = true;

  const currentRoundTimes = useMemo(
    () => (roundTimesWatched || []).slice(0, totalSlots),
    [roundTimesWatched, totalSlots]
  );

  const [manualErrors, setManualErrors] = useState<string[]>(() =>
    new Array(maxRounds).fill('')
  );

  const computeAutoTimes = useCallback(
    (start: string | undefined) => {
      if (!start) return new Array(totalSlots).fill('');
      const out: string[] = [];
      let prev = new Date(start);

      for (let i = 0; i < totalSlots; i++) {
        if (i === 0) {
          out[i] = format(prev, "yyyy-MM-dd'T'HH:mm");
        } else {
          const next = addMinutes(prev, ROUND_GAP_MINUTES);
          out[i] = format(next, "yyyy-MM-dd'T'HH:mm");
          prev = new Date(out[i]);
        }
      }
      return out;
    },
    [totalSlots]
  );

  useEffect(() => {
    const prev = (roundTimesWatched || []).slice();
    const arr = Array.from({ length: totalSlots }, (_, i) => prev[i] ?? '');
    if (startTime) arr[0] = startTime;
    if (startTime) {
      const auto = computeAutoTimes(startTime);
      setValue('rounds_times', auto, { shouldValidate: true });
      return;
    }
    setValue('rounds_times', arr, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlots, startTime, computeAutoTimes, setValue]);

  useEffect(() => {
    if (!startTime) return;
    const auto = computeAutoTimes(startTime);
    setValue('rounds_times', auto, { shouldValidate: true });
  }, [startTime, computeAutoTimes, setValue]);

  useEffect(() => {
    if (rounds <= 1) {
      setValid(true);
      setManualErrors(new Array(maxRounds).fill(''));
      return;
    }

    if (automate) {
      const allFilled =
        currentRoundTimes.length >= totalSlots &&
        currentRoundTimes.slice(0, totalSlots).every(Boolean);
      setValid(allFilled);
      setManualErrors(new Array(maxRounds).fill(''));
      return;
    }

    const errs = new Array(maxRounds).fill('');
    let ok = true;

    for (let i = 0; i < totalSlots; i++) {
      const val = currentRoundTimes[i] || '';
      const time = new Date(val);
      if (i === 0) {
        if (!startTime) {
          errs[i] = 'Tournament start time required';
          ok = false;
        } else if (
          !isValidDate(time) ||
          !isValidDate(new Date(startTime)) ||
          time.getTime() !== new Date(startTime).getTime()
        ) {
          errs[i] = 'Round 1 must match tournament start time';
          ok = false;
        }
        continue;
      }

      const prev = currentRoundTimes[i - 1];
      const prevM = prev ? new Date(prev) : null;

      if (!isValidDate(time)) {
        errs[i] = 'Invalid date/time';
        ok = false;
        continue;
      }
      if (!prevM || !isValidDate(prevM)) {
        errs[i] = 'Previous round time missing';
        ok = false;
        continue;
      }

      const diffHrs = differenceInHours(time, prevM);
      if (!isAfter(time, prevM) || diffHrs < ROUND_GAP_MINUTES / 60) {
        errs[i] = 'Each round must be at least 4h 30m after previous round';
        ok = false;
      }

      if (
        endTime &&
        isValidDate(new Date(endTime)) &&
        isAfter(time, new Date(endTime))
      ) {
        errs[i] = 'Must be before tournament end time';
        ok = false;
      }
    }

    setManualErrors(errs);
    setValid(ok);
  }, [rounds, totalSlots, automate, currentRoundTimes, startTime, endTime, setValid]);

  const handleManualChange = useCallback(
    (index: number, value: string) => {
      const prev = (roundTimesWatched || []).slice(0, totalSlots);
      prev[index] = value;
      if (index === 0 && startTime) {
        prev[0] = startTime;
      }
      setValue('rounds_times', prev, { shouldValidate: true });
    },
    [roundTimesWatched, totalSlots, startTime, setValue]
  );

  return (
    <div className="space-y-6">
      {/* Number of rounds */}
      <FormField
        control={control}
        name="rounds"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Number of Rounds{' '}
              <span className="text-muted-foreground/50 normal-case font-normal">
                (max {maxRounds})
              </span>
            </FormLabel>
            <FormControl>
              <div className="space-y-1.5">
                <Input
                  type="number"
                  min={1}
                  max={maxRounds}
                  {...field}
                  disabled={!startTime}
                  className={cn(
                    'h-10 rounded-xl border-border/60 focus:border-primary/50 bg-muted/30',
                    !startTime && 'opacity-60'
                  )}
                  value={field.value || '1'}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const c = Math.min(Math.max(1, v || 1), maxRounds);
                    field.onChange(String(c));
                  }}
                />
                {!startTime && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Set tournament start time first (in the Basic step)
                  </p>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Round timetable */}
      {startTime && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Round Schedule
            </p>
            <span className="text-[11px] text-primary bg-primary/8 border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">
              Auto · 4h 30m gaps
            </span>
          </div>

          <div className="space-y-2">
            {[...Array(totalSlots)].map((_, i) => {
              const isRoundOne = i === 0;
              const min = isRoundOne ? startTime : currentRoundTimes[i - 1] || '';
              const val = currentRoundTimes[i] || '';

              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    isRoundOne
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/50 bg-muted/20'
                  )}
                >
                  {/* Round badge */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isRoundOne
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    )}
                  >
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Round {i + 1}
                      {isRoundOne && (
                        <span className="ml-1.5 text-primary text-[10px] font-normal">
                          (Tournament Start)
                        </span>
                      )}
                    </p>
                    <Input
                      type="datetime-local"
                      min={min}
                      max={endTime || undefined}
                      value={val}
                      disabled={automate || isRoundOne}
                      onChange={(e) => handleManualChange(i, e.target.value)}
                      className="h-8 text-xs rounded-lg border-border/50 bg-background disabled:opacity-75"
                    />
                    {manualErrors[i] && (
                      <p className="text-red-500 text-[11px] mt-1">
                        {manualErrors[i]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
