'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useProTournaments } from '../../hook';
import { ProTournamentType, type ProTournamentStatus } from '../../_interface';
import {
  Calendar,
  Trophy,
  DollarSign,
  MapPin,
  Flag,
  Award,
  ExternalLink,
  Banknote,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/lib';
import { useParams } from 'next/navigation';
import { setActiveTournament } from '@/lib/redux/slices';
import { useEffect } from 'react';

interface ProDetailsProps {
  readonly className?: string;
}

const ProTournamentDetails: React.FC<ProDetailsProps> = ({ className }) => {
  const params: { leagueId: string } = useParams();
  const dispatch = useAppDispatch();
  const a = useAppSelector((s) => s.leagues.activeProLeague);

  const { detail } = useProTournaments({
    details: {
      id: params?.leagueId || a?.gameId as string,
      type: a?.type as ProTournamentType,
    },
  });

  // Sync Redux state with URL param and fetched data
  useEffect(() => {
    if (detail?.d && params?.leagueId) {
      dispatch(setActiveTournament({
        gameId: params.leagueId,
        type: a?.type,
        format: a?.format,
        name: detail.d.name,
        status: detail.d.status as ProTournamentStatus,
      }));
    }
  }, [detail?.d, params?.leagueId]);

  const tournament = detail?.d;

  if (detail?.loading || !tournament) {
    return <TournamentSkeleton />;
  }

  // Format dates
  const startDate = new Date(tournament?.start_date);
  const endDate = new Date(tournament?.end_date);
  const formattedDate =
    format(startDate, 'MMM d') + ' - ' + format(endDate, 'MMM d, yyyy');

  const formatCurrency = (amount?: string | number) => {
    if (amount == null) return 'N/A';

    const num =
      typeof amount === 'number'
        ? amount
        : parseFloat(amount.replace(/[^0-9.-]+/g, ''));

    if (isNaN(num)) return 'N/A';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  // Compact money formatter for large amounts (e.g., $20M instead of $20,000,000.00)
  const formatCompactCurrency = (amount?: string | number) => {
    if (amount == null) return 'N/A';

    const num =
      typeof amount === 'number'
        ? amount
        : parseFloat(amount.replace(/[^0-9.-]+/g, ''));

    if (isNaN(num)) return 'N/A';

    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const purseAmount = formatCompactCurrency(tournament?.purse_amount);
  const winnerPrize = formatCompactCurrency(tournament?.winner_prize);
  const purseAmountFull = formatCurrency(tournament?.purse_amount);
  const winnerPrizeFull = formatCurrency(tournament?.winner_prize);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Compact Hero Banner */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Logo + Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Tournament Logo */}
              <div className="relative shrink-0">
                <div className="relative w-20 h-20 rounded-lg border-2 border-border/50 bg-white shadow-sm overflow-hidden">
                  {tournament?.tournament_logo ? (
                    <Image
                      src={tournament?.tournament_logo}
                      alt={tournament?.name || ''}
                      fill
                      className="object-contain p-1.5"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 text-primary font-medium text-xs"
                  >
                    {tournament?.month} {tournament?.year}
                  </Badge>
                  <Badge
                    size="sm"
                    variant={
                      tournament?.status === 'active' ? 'default' : 'secondary'
                    }
                    className={cn(
                      'capitalize font-semibold text-xs',
                      tournament?.status === 'active' &&
                        'bg-gradient-to-r from-green-600 to-green-500 animate-pulse'
                    )}
                  >
                    {tournament?.status === 'active' && (
                      <span className="relative flex h-1.5 w-1.5 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </span>
                    )}
                    {tournament?.status === 'active' ? 'LIVE' : tournament?.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium"
                  >
                    {tournament?.tour?.toUpperCase()}
                  </Badge>
                </div>

                <h1 className="text-xl font-bold mb-1 truncate">
                  {tournament?.name}
                </h1>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tournament?.course.name}</span>
                  <span>•</span>
                  <span className="truncate">
                    {tournament?.course.city}, {tournament?.course.state || tournament?.course.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-2 shrink-0">
              {tournament?.ticket_url && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border/50 font-semibold"
                >
                  <Link href={tournament.ticket_url} target="_blank" className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    <span>Buy Tickets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}

              {tournament?.tournament_url && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border/50 font-semibold"
                >
                  <Link href={tournament.tournament_url} target="_blank" className="flex items-center gap-1.5">
                    <span>Official Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Stats Bar */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 divide-x divide-border/50">
            {/* Stat 1: Total Purse */}
            <div className="px-4 first:pl-0 last:pr-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-100">
                  <Banknote className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Purse
                </span>
              </div>
              <p
                className="text-2xl font-bold text-green-600"
                title={purseAmountFull}
              >
                {purseAmount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Prize pool
              </p>
            </div>

            {/* Stat 2: Winner's Prize */}
            <div className="px-4 first:pl-0 last:pr-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-100">
                  <Award className="w-4 h-4 text-amber-700" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Winner's Prize
                </span>
              </div>
              <p
                className="text-2xl font-bold text-amber-600"
                title={winnerPrizeFull}
              >
                {winnerPrize}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                First place
              </p>
            </div>

            {/* Stat 3: FedEx Cup */}
            <div className="px-4 first:pl-0 last:pr-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-100">
                  <Trophy className="w-4 h-4 text-purple-700" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  FedEx Cup
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {tournament?.fedex_cup || 'N/A'}
                {tournament?.fedex_cup && ' pts'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Championship points
              </p>
            </div>

            {/* Stat 4: Tournament Dates */}
            <div className="px-4 first:pl-0 last:pr-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Calendar className="w-4 h-4 text-blue-700" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tournament Dates
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground truncate">
                {formattedDate}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(startDate, 'EEEE')} to {format(endDate, 'EEEE')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Course Information */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-emerald-50">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Course Name
              </h4>
              <p className="text-base font-bold">{tournament?.course.name}</p>
            </div>

            {tournament?.course.city && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Location
                </h4>
                <p className="text-sm font-medium">
                  {tournament?.course.city}
                  {tournament?.course.state && `, ${tournament?.course.state}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tournament?.course.country}
                </p>
              </div>
            )}

            {tournament?.course?.location && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Full Address
                </h4>
                <p className="text-sm">{tournament?.course?.location}</p>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Status
              </h4>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    tournament?.status === 'active'
                      ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50'
                      : tournament?.status === 'upcoming'
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                  )}
                />
                <span className="capitalize font-semibold text-sm">
                  {tournament?.status === 'active'
                    ? 'IN PROGRESS'
                    : tournament?.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Defending Champion */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-amber-50">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              Defending Champion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tournament?.previous_winner ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold truncate">
                      {tournament?.previous_winner}
                    </h3>
                    <p className="text-xs font-medium text-amber-700">
                      2025 Champion
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                      Prize Won
                    </h4>
                    <p
                      className="text-base font-bold text-green-600"
                      title={winnerPrizeFull}
                    >
                      {winnerPrize}
                    </p>
                  </div>

                  {tournament?.fedex_cup && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                        FedEx Cup
                      </h4>
                      <p className="text-base font-bold">
                        {tournament?.fedex_cup} pts
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-0.5">
                  No Previous Winner
                </h3>
                <p className="text-xs text-muted-foreground">
                  This is a new tournament
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 3: Tournament Details */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-blue-50">
                <Flag className="w-4 h-4 text-blue-600" />
              </div>
              Tournament Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Month
                </h4>
                <p className="text-sm font-bold">{tournament?.month}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Year
                </h4>
                <p className="text-sm font-bold">
                  {tournament?.year.toString()}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Tour
                </h4>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {tournament?.tour?.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  Format
                </h4>
                <p className="text-sm font-bold">Stroke Play</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Prize Money
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Total Purse
                  </span>
                  <span
                    className="text-sm font-bold text-green-600"
                    title={purseAmountFull}
                  >
                    {purseAmount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Winner
                  </span>
                  <span
                    className="text-sm font-bold text-amber-600"
                    title={winnerPrizeFull}
                  >
                    {winnerPrize}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Skeleton Component
const TournamentSkeleton = () => (
  <div className="space-y-4">
    {/* Hero Skeleton */}
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Stats Bar Skeleton */}
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* 3-Column Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export { ProTournamentDetails };
