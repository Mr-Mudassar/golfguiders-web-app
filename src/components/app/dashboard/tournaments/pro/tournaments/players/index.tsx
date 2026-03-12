'use client';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { alpha3ToAlpha2, getName } from '@/lib/utils';
import { useFetchPlayers } from './infinite-players';
import type { ProTournamentType } from '../../_interface';
import { useLeaderboard } from '../../hook';
import { Skeleton, Card, CardContent, Input, Badge } from '@/components/ui';
import { FollowButton } from './follow-button';
import { useAppSelector } from '@/lib';
import Link from 'next/link';
import AvatarBox from '@/components/app/common/avatar-box';
import { Users, UserCheck, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

interface Props {
  className?: string;
}

export const ProPlayersList: React.FC<Props> = ({ className }) => {
  const params: { leagueId: string } = useParams();
  const act = useAppSelector((s) => s.leagues.activeProLeague);
  const [search, setSearch] = useState('');

  // Use URL param (leagueId) instead of Redux state for fetching data
  const {
    scores: data,
    loading,
    error,
  } = useLeaderboard(act?.type!, params?.leagueId || act?.gameId!);

  // Filter players based on search
  const filteredPlayers = useMemo(() => {
    if (!data?.leaderboard) return [];
    if (!search) return data.leaderboard;

    return data.leaderboard.filter((player) => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
  }, [data?.leaderboard, search]);

  // Show full page loading skeleton on initial load
  if (loading && !data) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Header Skeleton */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="p-2.5 rounded-lg w-10 h-10" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-9 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Players List Skeleton */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-0">
            <div className="h-[65vh] overflow-y-auto divide-y divide-border/30">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center gap-3 p-4 animate-in fade-in duration-300"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-4 w-8" />
                    <div className="relative">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="absolute right-0 bottom-0 h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary text-white shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-xl mb-1.5">{data?.tournament_name || 'Tournament Players'}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 text-primary font-medium text-xs"
                  >
                    {data?.year || '2026'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {filteredPlayers.length} {filteredPlayers.length === 1 ? 'Player' : 'Players'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                className="h-9 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <div className="h-[65vh] overflow-y-auto divide-y divide-border/30">
            {/* Loading State */}
            {loading &&
              Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center gap-3 p-4 animate-in fade-in duration-300"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-8" />
                    <div className="relative">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="absolute right-0 bottom-0 h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}

            {/* Player Rows */}
            {!loading && filteredPlayers.map((p, i) => {
              const code = alpha3ToAlpha2(p?.country_flag);

              return (
                <div key={p?.player_id} className="group hover:bg-muted/50 transition-colors">
                  <Link
                    href={`player/${act?.type}/${p?.player_id}`}
                    className="flex justify-between items-center gap-3 p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-8 text-sm font-semibold text-muted-foreground group-hover:text-primary">
                        {i + 1}
                      </span>
                      <div className="relative shrink-0">
                        <AvatarBox
                          src={p?.image_url || ''}
                          name={getName(p?.first_name, p?.last_name)}
                        />
                        <div className="absolute right-0 bottom-0 ring-2 ring-background rounded-sm">
                          {code ? (
                            <ReactCountryFlag svg countryCode={code} className="!w-5 !h-4" />
                          ) : (
                            <span className="w-5 h-4 animate-pulse border bg-muted rounded-sm" />
                          )}
                        </div>
                      </div>
                      <p className="font-medium group-hover:text-primary truncate">
                        {p.first_name} {p.last_name}
                      </p>
                    </div>

                    <FollowButton
                      activePlayer={{
                        id: p?.player_id,
                        is_following: p?.is_following,
                        name: getName(p?.first_name, p?.last_name),
                        tour: act?.type as ProTournamentType,
                      }}
                      sm
                      size="default"
                    />
                  </Link>
                </div>
              );
            })}

            {/* Empty State */}
            {!loading && filteredPlayers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                    <UserCheck className="w-10 h-10 text-primary" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {search ? 'No Players Found' : 'No Players Available'}
                </h3>

                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  {search
                    ? `No players matching "${search}" were found. Try adjusting your search.`
                    : 'The player list is currently empty. Players will appear here once the tournament field is announced.'}
                </p>

                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
