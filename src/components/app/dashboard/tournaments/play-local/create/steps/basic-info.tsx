'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { TournamentFormValues } from '../';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getMinConstraints, scoringMethods } from '../../helper';
import { Info, Calendar, Hash, Timer } from 'lucide-react';
import GolfFormStep from './golf-course';
import { addHours, format, isValid as isValidDate, subHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export default function BasicInfoStep({
  edit,
  setValid,
}: {
  edit: boolean;
  setValid: (b: boolean) => void;
}) {
  const { control, watch, setValue, formState } =
    useFormContext<TournamentFormValues>();
  const [showInfo, setShowInfo] = useState(false);

  const scoringMethod = watch('scoring_method');
  const startTime = useWatch({ control, name: 'start_time', defaultValue: '' });

  const prevScoringMethod = useRef(scoringMethod);

  const { minTime } = useMemo(
    () => getMinConstraints(watch('start_time')),
    [watch]
  );

  // Allow selecting start times up to 4 hours in the past (today only)
  const minStartDateTime = useMemo(
    () => format(subHours(new Date(), 4), "yyyy-MM-dd'T'HH:mm"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (prevScoringMethod.current !== scoringMethod) {
      setValue('players', []);
      setValue('teams', []);
      prevScoringMethod.current = scoringMethod;
    }
  }, [scoringMethod, setValue]);

  useEffect(() => {
    if (startTime && isValidDate(new Date(startTime))) {
      const end = format(addHours(new Date(startTime), 4), "yyyy-MM-dd'T'HH:mm");
      setValue('end_time', end, { shouldValidate: true });
    } else if (!startTime) {
      setValue('end_time', '', { shouldValidate: true });
    }
  }, [startTime, setValue]);

  const scoringCards = [
    {
      id: 'STROKEPLAY',
      name: 'Stroke Play',
      description: 'Total strokes counted',
    },
    {
      id: 'STABLEFORD',
      name: 'Stableford',
      description: 'Points per hole',
    },
    {
      id: 'BESTBALL',
      name: 'Best Ball',
      description: 'Best team score per hole',
    },
    {
      id: 'SCRAMBLE',
      name: 'Scramble',
      description: 'All play from best shot',
    },
  ];

  useEffect(() => {
    const arr = watch([
      'coursename',
      'name',
      'end_time',
      'start_time',
      'scoring_method',
    ]);
    if (Boolean(arr?.every((f) => f !== ''))) {
      setValid(true);
    } else {
      setValid(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, setValue, watch, setValid]);

  return (
    <div className="space-y-6">
      {/* Tournament Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tournament Name
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Summer Cup 2026"
                className="h-10 rounded-xl border-border/60 focus:border-primary/50 bg-muted/30"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your tournament…"
                className="resize-none rounded-xl border-border/60 focus:border-primary/50 bg-muted/30 min-h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Start Time */}
      <FormField
        control={control}
        name="start_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Start Date &amp; Time
            </FormLabel>
            <FormControl>
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                min={minStartDateTime}
                placeholder="Select start date & time"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hidden End Time */}
      <FormField
        control={control}
        name="end_time"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input type="datetime-local" min={minTime} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Golf Course */}
      <GolfFormStep />

      {/* Scoring Method */}
      <FormField
        control={control}
        disabled={edit}
        name="scoring_method"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-2">
              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide m-0">
                Scoring Method
              </FormLabel>
              <div className="flex items-center gap-2">
                {edit && (
                  <span className="text-[11px] text-muted-foreground">
                    Cannot be changed
                  </span>
                )}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo((s) => !s);
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                    showInfo
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  )}
                  title={showInfo ? 'Hide info' : 'Show scoring info'}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <FormControl>
              <div className="space-y-3">
                {/* Info panel */}
                {showInfo && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
                    <span className="font-semibold text-primary capitalize">
                      {scoringMethod?.charAt(0) + scoringMethod?.slice(1).toLowerCase()}:
                    </span>{' '}
                    {scoringMethods?.find((e) => e.title === scoringMethod)?.description}
                  </div>
                )}

                {/* Card grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {scoringCards.map((card) => {
                    const isActive = field.value === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        disabled={edit}
                        onClick={() => field.onChange(card.id)}
                        className={cn(
                          'flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-200',
                          isActive
                            ? 'border-primary bg-primary/8 shadow-sm shadow-primary/10'
                            : 'border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-primary/5',
                          edit && 'opacity-60 cursor-not-allowed pointer-events-none'
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              isActive ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            {card.name}
                          </span>
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                              isActive
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30'
                            )}
                          >
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          {card.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rounds + Tee Interval */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="rounds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Rounds
                <span className="text-muted-foreground/50 normal-case font-normal">(1–18)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={18}
                  step={1}
                  placeholder="1"
                  className="h-10 rounded-xl border-border/60 focus:border-primary/50 bg-muted/30"
                  value={field.value}
                  onKeyDown={(e) => { if (e.key === '.' || e.key === 'e') e.preventDefault(); }}
                  onChange={(e) => {
                    const raw = Math.floor(Number(e.target.value));
                    const clamped = Math.min(18, Math.max(1, isNaN(raw) ? 1 : raw));
                    field.onChange(String(clamped));
                  }}
                  onBlur={(e) => {
                    const raw = Math.floor(Number(e.target.value));
                    const clamped = Math.min(18, Math.max(1, isNaN(raw) || raw < 1 ? 1 : raw));
                    field.onChange(String(clamped));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tee_interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" />
                Tee Interval (min)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={2}
                  step={1}
                  placeholder="10"
                  className="h-10 rounded-xl border-border/60 focus:border-primary/50 bg-muted/30"
                  value={field.value}
                  onKeyDown={(e) => { if (e.key === '.' || e.key === 'e') e.preventDefault(); }}
                  onChange={(e) => {
                    const raw = Math.floor(Number(e.target.value));
                    field.onChange(isNaN(raw) ? 2 : raw);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
