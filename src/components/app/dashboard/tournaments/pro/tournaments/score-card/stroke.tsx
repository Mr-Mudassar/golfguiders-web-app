// components/score-card/TeamStrokeScoreCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Icon,
} from '@/components/ui';
import {
  ProScores,
  ProTournamentType,
  TeamStrokeEntry,
} from '../../_interface';
import { Info, Target, BarChart3, TrendingUp } from 'lucide-react';
import { ReactCountryFlag } from 'react-country-flag';
import { alpha3ToAlpha2, getName, useGetCountryName } from '@/lib/utils';
import { calcStats, teeColor } from '../_utils';
import AvatarBox from '@/components/app/common/avatar-box';
import { FollowButton } from '../players/follow-button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/lib';

interface TeamStrokeScoreCardProps {
  teamId: string;
  teamPlayers: TeamStrokeEntry[];
  data: ProScores;
  refetch: () => Promise<void>;
}

export const ScoreBadge = ({
  status,
  icon = true,
}: {
  status?: string;
  icon?: boolean;
}) => {
  if (!status) return null;

  const configs = {
    EAGLE: { color: 'bg-blue-500 text-white', icon: '🦅' },
    BIRDIE: { color: 'bg-green-500 text-white', icon: '🐦' },
    PAR: { color: 'bg-gray-200 text-gray-800', icon: '•' },
    BOGEY: { color: 'bg-yellow-500 text-white', icon: '⛳' },
    'DOUBLE_BOGEY+': { color: 'bg-red-500 text-white', icon: '💥' },
  };

  const config = configs[status as keyof typeof configs] || configs.PAR;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0 rounded-full text-xs ${config.color}`}
    >
      {icon && <span>{config.icon}</span>}
      <span className="font-medium text-xxs">{status.replace('_', ' ')}</span>
    </span>
  );
};

export const TeamStrokeScoreCard: React.FC<TeamStrokeScoreCardProps> = ({
  teamId,
  teamPlayers,
  data,
  refetch,
}) => {
  const [round, setRound] = useState('0');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [activeHole, setActiveHole] = useState<number | null>(1);
  const [viewMode, setViewMode] = useState<'score' | 'stats'>('score');
  const { getCountryName } = useGetCountryName();
  const { type } = useAppSelector((s) => s.leagues?.activeProLeague);
  const [hoveredHole, setHoveredHole] = useState<number | null>(null);

  const rounds = data.rounds;
  const holes = rounds?.[Number(round)]?.holes;

  const visibleHoles = useMemo(() => {
    return side === 'front' ? holes?.slice(0, 9) : holes?.slice(9, 18);
  }, [holes, side]);

  const activeHoleData =
    activeHole !== null
      ? holes?.find((h) => h.hole_number === activeHole)
      : null;

  const stats = useMemo(() => calcStats(holes), [holes]);

  const totalRound = holes?.reduce(
    (sum, h) => sum + (Number(h.score ?? h?.team_score) || 0),
    0
  );
  const totalPar = holes?.reduce((sum, h) => sum + (Number(h?.par) || 0), 0);

  if (!holes?.length) {
    return (
      <div className="p-6 text-center border rounded-lg">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h4 className="font-semibold">No Score Card Available</h4>
        <p className="text-sm text-muted-foreground">
          Score data will appear during the tournament
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card border rounded-lg shadow-sm space-y-4">
      {/* Team Info */}
      <div className="border-b pb-3">
        <h3 className="font-bold text-lg">Team {teamId}</h3>
        <div
          className="grid gap-5 mt-2"
          style={{
            gridTemplateColumns: `repeat(${teamPlayers?.length ?? 1}, minmax(0, 1fr))`,
          }}
        >
          {teamPlayers.map((player) => (
            <div key={player.player_id} className="flex items-center gap-8">
              <AvatarBox
                src={player?.image_url || ''}
                name={getName(player.first_name, player.last_name)}
                className="size-20"
              />
              <div>
                <p className="font-bold text-lg">
                  {getName(player.first_name, player.last_name)}
                </p>
                {player.country_flag && (
                  <ReactCountryFlag
                    svg
                    countryCode={alpha3ToAlpha2(player.country_flag) || ''}
                    className="w-4 h-4 mr-2"
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  {getCountryName(player?.country_flag)}
                </span>
              </div>
              <div className="grid gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`player/${type}/${player?.player_id}`}>
                    Profile
                    <Icon name="chevron-right" />
                  </Link>
                </Button>
                <FollowButton
                  sm
                  activePlayer={{
                    id: player?.player_id,
                    is_following: player?.is_following,
                    name: getName(player?.first_name, player?.last_name),
                    tour: type as ProTournamentType,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-bold text-lg">Team Score Card</h4>
          <p className="text-sm text-muted-foreground">
            Round {Number(round) + 1} •{' '}
            {side === 'front' ? 'Front 9' : 'Back 9'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'score' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('score')}
            >
              Score Card
            </Button>
            <Button
              variant={viewMode === 'stats' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('stats')}
            >
              Statistics
            </Button>
          </div>

          <Select value={round} onValueChange={setRound}>
            <SelectTrigger className="w-28">
              <SelectValue>Round {Number(round) + 1}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {rounds?.map((_, i) => (
                <SelectItem key={i} value={String(i)}>
                  Round {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === 'score' ? (
        <>
          {/* Hole Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant={side === 'front' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSide('front')}
              >
                Front 9 (1-9)
              </Button>
              <Button
                variant={side === 'back' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSide('back')}
              >
                Back 9 (10-18)
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <h4 className="font-semibold">Score Legend</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Eagle (-2)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Birdie (-1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-gray-500" />
                      <span>Par (0)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500" />
                      <span>Bogey (+1)</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <div className="w-3 h-3 bg-red-500" />
                      <span>Double Bogey or worse (+2+)</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Hint Banner */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Tip:</span> Click on any hole number in the table below to view detailed statistics for that hole
            </p>
          </div>

          {/* Score Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y border-b">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Hole</th>
                  {visibleHoles?.map((h) => (
                    <th
                      key={h.hole_number}
                      className={`text-center p-2 min-w-12 cursor-pointer transition-all select-none ${
                        activeHole === h.hole_number
                          ? 'bg-primary/20 font-bold text-primary ring-2 ring-primary ring-inset'
                          : 'hover:bg-primary/10 hover:font-semibold hover:scale-105'
                      }`}
                      onClick={() => setActiveHole(h.hole_number)}
                      title={`Click to view Hole ${h.hole_number} details`}
                    >
                      {h.hole_number}
                    </th>
                  ))}
                  <th className="text-center font-medium">
                    {side == 'front' ? 'Out' : 'In'}
                  </th>
                  <th className="text-center p-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-medium">Par</td>
                  {visibleHoles?.map((h) => (
                    <td
                      key={h.hole_number}
                      className={`text-center p-2 ${activeHole === h.hole_number ? 'bg-primary/5' : ''
                        }`}
                      onClick={() => setActiveHole(h.hole_number)}
                    >
                      {h.par}
                    </td>
                  ))}
                  <td className="text-center p-2 font-bold">
                    {visibleHoles?.reduce((sum, h) => sum + (h.par || 0), 0)}
                  </td>
                  <td className="text-center p-2 font-bold">{totalPar}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Score</td>
                  {visibleHoles?.map((h) => {
                    return (
                      <td
                        key={h.hole_number}
                        onMouseEnter={() => setHoveredHole(h.hole_number)}
                        onMouseLeave={() => setHoveredHole(null)}
                        onClick={() => setActiveHole(h.hole_number)}
                      >
                        <div
                          className={`text-center ${teeColor(h?.status ?? h?.team_status)}
    p-2 relative ${activeHole === h.hole_number ? 'bg-primary/10' : ''}`}
                        >
                          <div className="font-bold">
                            {Number(h.score ?? h?.team_score)}
                          </div>

                          {hoveredHole === h.hole_number && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ScoreBadge
                                icon={false}
                                status={h.status ?? h?.team_status}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center p-2 font-bold">
                    {visibleHoles?.reduce(
                      (sum, h) => sum + (Number(h.score ?? h?.team_score) || 0),
                      0
                    )}
                  </td>
                  <td className="text-center p-2 font-bold">{totalRound}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Status</td>
                  {visibleHoles?.map((h) => (
                    <td
                      key={h.hole_number}
                      className={`text-center p-2 ${activeHole === h.hole_number ? 'bg-primary/5' : ''
                        }`}
                      onClick={() => setActiveHole(h.hole_number)}
                    >
                      {h.par}
                    </td>
                  ))}
                  <td className="text-center p-2 font-bold">
                    {visibleHoles?.reduce(
                      (sum, h) => sum + (Number(h?.team_total) || 0),
                      0
                    )}
                  </td>
                  <td
                    className={`text-center p-2 font-bold ${totalRound - totalPar < 0 ? 'text-destructive' : 'text-primary'}`}
                  >
                    {totalRound - totalPar}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Active Hole Details */}
          {activeHoleData && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h5 className="font-bold text-lg">
                      Hole # {activeHoleData.hole_number}
                    </h5>
                    <ScoreBadge
                      status={activeHoleData.status ?? activeHoleData?.team_status}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click next hole to see details
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentIndex = holes?.findIndex(
                        (h) => h.hole_number === activeHole
                      );
                      if (currentIndex !== undefined && currentIndex > 0) {
                        setActiveHole(holes![currentIndex - 1].hole_number);
                      }
                    }}
                    disabled={
                      holes?.findIndex((h) => h.hole_number === activeHole) === 0
                    }
                    className="h-9 px-3"
                  >
                    <Icon name="chevron-left" className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentIndex = holes?.findIndex(
                        (h) => h.hole_number === activeHole
                      );
                      if (
                        currentIndex !== undefined &&
                        holes &&
                        currentIndex < holes.length - 1
                      ) {
                        setActiveHole(holes[currentIndex + 1].hole_number);
                      }
                    }}
                    disabled={
                      holes?.findIndex((h) => h.hole_number === activeHole) ===
                      (holes?.length ?? 0) - 1
                    }
                    className="h-9 px-3"
                  >
                    <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Par</p>
                  <p className="text-2xl font-bold">{activeHoleData.par}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">
                    {Number(activeHoleData.score ?? activeHoleData?.team_score)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-2xl font-bold">
                    {activeHoleData.yardage || 'N/A'} yds
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To Par</p>
                  <p className="text-2xl font-bold">
                    {Number(
                      activeHoleData.score ?? activeHoleData?.team_score
                    ) -
                      activeHoleData.par >
                      0
                      ? '+'
                      : ''}
                    {Number(
                      activeHoleData.score ?? activeHoleData?.team_score
                    ) - activeHoleData.par}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Statistics View */
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">To Par</p>
              <p
                className={`text-3xl font-bold ${stats?.toPar === 0
                  ? 'text-gray-700'
                  : (stats?.toPar || 0) < 0
                    ? 'text-green-600'
                    : 'text-red-600'
                  }`}
              >
                {stats?.toPar && stats.toPar > 0 ? '+' : ''}
                {stats?.toPar || 0}
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Strokes</p>
              <p className="text-3xl font-bold">
                {teamPlayers?.find((t) => t.team_id === teamId)?.strokes || 0}
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Fairways Hit</p>
              <p className="text-3xl font-bold">
                {stats?.fairwaysHit || 'N/A'}
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Putts</p>
              <p className="text-3xl font-bold">{stats?.totalPutts || 'N/A'}</p>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="border rounded-lg p-4">
            <h5 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Score Distribution
            </h5>
            <div className="space-y-3">
              {[
                {
                  label: 'Eagles',
                  value: stats?.eagles || 0,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Birdies',
                  value: stats?.birdies || 0,
                  color: 'bg-green-500',
                },
                {
                  label: 'Pars',
                  value: stats?.pars || 0,
                  color: 'bg-gray-500',
                },
                {
                  label: 'Bogeys',
                  value: stats?.bogeys || 0,
                  color: 'bg-yellow-500',
                },
                {
                  label: 'Double Bogeys+',
                  value: stats?.doubleBogeys || 0,
                  color: 'bg-red-500',
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-24 text-sm">{stat.label}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 rounded ${stat.color}`}
                        style={{ width: `${(stat.value / 18) * 100}%` }}
                      />
                      <span className="text-sm font-medium">{stat.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="border rounded-lg p-4">
            <h5 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Summary
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Scoring Average</p>
                <p className="text-2xl font-bold">
                  {stats?.totalStrokes
                    ? (stats.totalStrokes / 18).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Birdie or Better %
                </p>
                <p className="text-2xl font-bold">
                  {stats
                    ? (((stats.eagles + stats.birdies) / 18) * 100).toFixed(1)
                    : '0'}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
