'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type {
  ProTournamentStatus,
  ProTournamentType,
  TypeItem,
  YearItem,
} from '../_interface';
import { useAppDispatch, useAppSelector } from '@/lib';
import { setFilters } from '@/lib/redux/slices';

export function TourSelectBox({
  fetch,
  loading,
  typeData: data,
}: {
  typeData: TypeItem[];
  loading: boolean;
  fetch: () => Promise<TypeItem[]>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const f = useAppSelector((s) => s.leagues.activeFilters);
  const [selected, setSelected] = useState<string | undefined>(
    f?.tournament || undefined
  );
  const dispatch = useAppDispatch();

  const handleSelect = (value: string | undefined) => {
    setSelected(value);
    setIsOpen(false);
    fetch();
    dispatch(
      setFilters({
        ...f,
        tournament: value as ProTournamentType,
      })
    );
  };

  const n = data?.find((t) => t.pre_fix === selected)?.name ?? undefined;
  const select = (v: string) => (v === 'all' ? undefined : v);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-2">
          {selected ? n : 'All Tours'}
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1.5" align="end">
        {loading ? (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {data?.map((item, index) => (
              <button
                key={item.pre_fix + index}
                onClick={() => handleSelect(select(item?.pre_fix))}
                className={cn(
                  'flex items-center justify-between px-2.5 py-2 rounded-md text-sm transition-colors cursor-pointer',
                  selected === item?.pre_fix
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="size-5 rounded-full"
                  />
                  <span>{item.name}</span>
                </div>
                {selected === select(item?.pre_fix) && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function YearSelectBox({
  handleFetch,
  loading,
  yearData: data,
}: {
  yearData: YearItem[];
  loading: boolean;
  handleFetch: () => Promise<YearItem[]>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const f = useAppSelector((s) => s.leagues.activeFilters);
  const [selected, setSelected] = useState<string>(
    f?.params?.year ?? new Date().getFullYear()?.toString()
  );

  useEffect(() => {
    const getTypes = async () => {
      if (!!selected) return;

      if (data && data.length) {
        setSelected(data[0]?.year);
        dispatch(
          setFilters({
            ...f,
            params: {
              ...f?.params,
              year: data[0]?.year,
            },
          })
        );
      }
    };

    getTypes();
  }, [data]);

  const handleSelect = (item: YearItem) => {
    setSelected(item?.year);
    setIsOpen(false);
    dispatch(
      setFilters({
        ...f,
        params: {
          ...f?.params,
          year: item?.year,
        },
      })
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-border/50 text-xs font-medium gap-1.5"
        >
          {selected ? selected : 'Year'}
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1.5" align="end">
        {loading ? (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
            {data?.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer',
                  selected === item.year
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                {selected === item.year ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <span className="w-3.5" />
                )}
                <span>{item.year}</span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function StateSelectBox({
  size = 'sm',
}: {
  size?: 'sm' | 'lg' | 'default';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const f = useAppSelector((s) => s.leagues?.activeFilters);
  const [selected, setSelected] = useState<ProTournamentStatus>(
    f?.status || 'INPROGRESS'
  );

  const tabs: { name: string; value: ProTournamentStatus }[] = [
    { name: 'Live', value: 'INPROGRESS' },
    { name: 'Upcoming', value: 'UPCOMING' },
    { name: 'Finished', value: 'COMPLETED' },
  ];

  const onTabChange = (value: ProTournamentStatus) => {
    setSelected(value);
    setIsOpen(false);
    dispatch(
      setFilters({
        ...f,
        status: value,
      })
    );
  };

  useEffect(() => {
    if (!f?.status) {
      dispatch(
        setFilters({
          ...f,
          status: 'INPROGRESS',
        })
      );
    }
  }, [dispatch]);

  const n = tabs?.find((t) => t.value == selected)?.name;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className="flex items-center gap-2"
        >
          {n}
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1.5">
        <div className="flex flex-col gap-0.5">
          {tabs.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                onTabChange(item.value);
                setIsOpen(false);
              }}
              className={cn(
                'flex text-sm items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer',
                selected === item.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              {selected === item.value ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <span className="w-3.5" />
              )}
              {item.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
