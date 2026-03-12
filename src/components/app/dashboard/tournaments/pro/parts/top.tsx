'use client';

import { Button, Card, CardContent } from '@/components/ui';
import { YearSelectBox } from './select';
import { Trophy, Ticket } from 'lucide-react';
import { useFilters } from '../hook';
import type { YearItem } from '../_interface';
import { usePathname } from '@/i18n/routing';
import Link from 'next/link';

export const TopBar = () => {
  const { filterBy, load, fetch } = useFilters(undefined);

  const handleYear = async (): Promise<YearItem[]> => {
    const d = await fetch?.year({});
    return d?.data?.getProTournamentsYears as YearItem[] ?? { getProTournamentsYears: [] };
  };

  const p = usePathname();

  const isTick = p?.includes('/tickets');

  return (
    <Card className="border-border/50">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            {isTick ? (
              <Ticket className="size-[18px] text-primary" />
            ) : (
              <Trophy className="size-[18px] text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base truncate">
              {isTick ? 'Pro Leaderboard Tickets' : 'Pro Leaderboards'}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {isTick
                ? 'Purchase tickets for upcoming tournaments'
                : 'Professional tournaments worldwide'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <YearSelectBox
            yearData={(filterBy?.years as YearItem[]) || []}
            handleFetch={handleYear}
            loading={load?.year || false}
          />

          <Link href={isTick ? '.' : 'pro/tickets'}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-border/50 text-xs font-medium gap-1.5"
            >
              {isTick ? (
                <Trophy className="size-3.5" />
              ) : (
                <Ticket className="size-3.5" />
              )}
              {isTick ? 'Leaderboards' : 'Buy Tickets'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
