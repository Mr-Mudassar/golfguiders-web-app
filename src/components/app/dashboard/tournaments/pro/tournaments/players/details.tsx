'use client';

import React from 'react';
import AvatarBox from '@/components/app/common/avatar-box';
import ReactCountryFlag from 'react-country-flag';
import { FollowButton } from './follow-button';
import { alpha3ToAlpha2, getName } from '@/lib/utils';
import { ProTournamentType } from '../../_interface';
import {
  Trophy,
  Calendar,
  MapPin,
  GraduationCap,
  User,
  Ruler,
  Weight,
  Globe,
  Home,
  Target,
  Award,
  TrendingUp,
  Trophy as TrophyIcon,
  CalendarDays,
  CheckCircle2,
  Medal,
  ShieldCheckIcon,
  ListOrdered,
  List,
  Banknote,
  Landmark,
  Flag,
  TrendingDown,
  Star,
  Hash,
  ArrowLeft,
  UserX,
} from 'lucide-react';
import { usePlayers } from '../../hook';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { useLocale } from 'next-intl';

export type UnifiedPlayer = {
  id: string;
  tour: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  country_flag?: string;

  // PGA & Champions fields
  height?: string;
  weight?: string;
  age?: number;
  birthday?: string;
  country?: string;
  residence?: string;
  birth_place?: string;
  family?: string;
  college?: string | null;
  turned_pro?: number;

  // LPGA specific fields
  rookie_year?: number;
  year_joined?: number;
  starts?: number;
  cuts_made?: number;
  top_10?: number;
  wins?: number;
  low_round?: number;
  official_earnings_amount?: number;
  cme_points_rank?: number;
  cme_points?: string;

  personal?: {
    age?: number;
    height?: string;
    weight?: string;
    residence?: string;
    college?: string;
    turned_pro?: number;
  };

  statistics?: Record<string, string | number | null | { rank: string; value: string }>;
  tournaments?: Tournament[];
  is_following?: boolean;
};

export const PlayerDetails: React.FC = () => {
  const pr: { type: ProTournamentType; playerId: string } = useParams();
  const router = useRouter();
  const locale = useLocale();

  const { detail: p, loading } = usePlayers(pr?.type, pr?.playerId);

  const code = p?.country_flag ? alpha3ToAlpha2(p?.country_flag) : undefined;
  const name = getName(p?.first_name, p?.last_name);


  const personalInfo = {
    age: p?.age || p?.personal?.age,
    height: p?.height || p?.personal?.height,
    weight: p?.weight || p?.personal?.weight,
    residence: p?.residence || p?.personal?.residence,
    college: p?.college || p?.personal?.college,
    turned_pro: p?.turned_pro || p?.personal?.turned_pro,
    country: p?.country,
    birth_place: p?.birth_place,
    family: p?.family,
    rookie_year: p?.rookie_year,
    year_joined: p?.year_joined,
  };

  const getStatistics = (): Record<string, { value: string | number | null; rank?: string }> => {
    if (p?.statistics && Object.keys(p?.statistics).length > 0) {
      const normalized: Record<string, { value: string | number | null; rank?: string }> = {};
      for (const [key, val] of Object.entries(p.statistics)) {
        if (val && typeof val === 'object' && 'value' in val) {
          const obj = val as { rank: string; value: string };
          normalized[key] = { value: obj.value, rank: obj.rank };
        } else {
          normalized[key] = { value: val as string | number | null };
        }
      }
      return normalized;
    }

    const stats: Record<string, { value: string | number | null }> = {};
    if (p?.starts !== undefined) stats.starts = { value: p?.starts };
    if (p?.cuts_made !== undefined) stats.cuts_made = { value: p?.cuts_made };
    if (p?.top_10 !== undefined) stats.top_10 = { value: p?.top_10 };
    if (p?.wins !== undefined) stats.wins = { value: p?.wins };
    if (p?.low_round !== undefined) stats.low_round = { value: p?.low_round };
    if (p?.official_earnings_amount !== undefined)
      stats.official_money = { value: p?.official_earnings_amount };
    if (p?.cme_points_rank !== undefined) stats.cme_rank = { value: p?.cme_points_rank };
    if (p?.cme_points !== undefined) stats.cme_points = { value: p?.cme_points };

    return stats;
  };

  const statistics = getStatistics();
  const hasTournaments = p?.tournaments && p?.tournaments.length > 0;

  // Show loading skeleton while data is being fetched
  if (loading && !p) {
    return <PlayerDetailsSkeleton />;
  }

  // Show only the No Data card when API returns no data (e.g. BAD_REQUEST error)
  if (!loading && !p) {
    return (
      <div className="p-6 space-y-8 min-h-screen">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="default"
            onClick={() => router.back()}
            className="border-border/50 hover:bg-muted/50 font-semibold flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to List</span>
          </Button>
        </div>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                <UserX className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Detailed statistics and information are not available for this player at the moment.
              Please check back later for updated information.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-4">
              <Card className="border-border/50 bg-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold">Player profile pending</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Updates</p>
                  <p className="text-sm font-semibold">Check back soon</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Back Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="default"
          onClick={() => router.back()}
          className="border-border/50 hover:bg-muted/50 font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </Button>
      </div>

      {/* Header Section  */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/5 via-card to-primary/5 border-border/50 border p-6 backdrop-blur-sm shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-16">
          <div className="relative">
            {/* <div className="absolute inset-0 rounded-full border opacity-30 animate-ping" /> */}
            <AvatarBox
              src={p?.image_url as string}
              name={name}
              className="size-44 border-4 border-primary shadow-lg relative"
            />
            {code && (
              <div className="absolute bottom-2 right-2 size-10 flex justify-center items-center border-2 border-white rounded-full overflow-hidden shadow-lg bg-white">
                <ReactCountryFlag
                  style={{ width: '2.5em', height: '2.5em' }}
                  svg
                  countryCode={code}
                />
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">
                    {name}
                  </h1>
                  <Badge className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white shadow-sm">
                    <Globe className="size-3" />
                    {p?.tour.toUpperCase()}
                  </Badge>
                </div>

                {p?.country && (
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span className="font-medium">{p?.country}</span>
                    {p?.residence && (
                      <>
                        <span className="text-muted-foreground/75">•</span>
                        <span>{p?.residence}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <FollowButton
                activePlayer={{
                  id: pr?.playerId,
                  is_following: p?.is_following!,
                  name,
                  tour: pr?.type,
                }}
                size="lg"
                sm
              />
            </div>

            {/* Quick Stats Bar */}
            {(personalInfo?.age ||
              personalInfo?.height ||
              personalInfo?.weight) && (
                <div className="flex flex-wrap gap-4 pt-3">
                  {personalInfo?.age && (
                    <PersonalItem
                      icon={User}
                      value={personalInfo?.age}
                      title="Age"
                    />
                  )}

                  {personalInfo?.height && (
                    <PersonalItem
                      icon={Ruler}
                      value={personalInfo?.height
                        ?.replace(' feet and ', "'")
                        .replace(' inches', '"')}
                      title="Height"
                    />
                  )}

                  {personalInfo?.weight && (
                    <PersonalItem
                      icon={Weight}
                      value={personalInfo?.weight}
                      title="Weight"
                    />
                  )}

                  {personalInfo?.turned_pro && (
                    <PersonalItem
                      icon={Calendar}
                      value={personalInfo?.turned_pro}
                      title="Pro Since"
                    />
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Statistics */}
        {Object.keys(statistics).length > 0 && (
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Career Statistics
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Performance metrics & achievements
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(statistics).map(([key, val]) => {
                  const { label, value, valueLabel, rank } = getStatDisplay(key, val);
                  if (!value) return null;

                  return (
                    <div
                      key={key}
                      className="relative overflow-hidden flex items-center justify-between rounded-full bg-muted/40 border border-border/50 px-6 py-4 hover:shadow-md transition-all"
                    >
                      {/* Dotted decoration on right */}
                      <div className="absolute right-0 top-0 bottom-0 w-24 opacity-[0.07]" style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '8px 8px',
                      }} />

                      {/* Stat name */}
                      <h3 className="font-bold text-base relative z-10">
                        {label}
                      </h3>

                      {/* POS + Value columns */}
                      <div className="flex items-center gap-0 relative z-10">
                        {rank && (
                          <div className="text-center border-r border-border/60 px-4">
                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">POS</div>
                            <div className="text-base font-bold mt-0.5">{rank}</div>
                          </div>
                        )}
                        <div className="text-center px-4">
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{valueLabel}</div>
                          <div className="text-base font-bold mt-0.5">{value}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </CardContent>
            </Card>

            {/* Tournaments Section */}
            {hasTournaments && (
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Trophy className="size-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        Recent Tournaments
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Last {p?.tournaments?.length} tournament performances
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {p?.tournaments!.length} total tournaments
                  </div>
                </div>
                <TournamentTable tournaments={p?.tournaments} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Right Column - Personal Info */}
        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="size-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Personal Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Player background & information
                </p>
              </div>
            </div>

            {personalInfo?.residence || personalInfo?.birth_place || (personalInfo?.college && personalInfo.college !== 'null') || personalInfo?.rookie_year || personalInfo?.year_joined || personalInfo?.family || p?.birthday ? (
              <div className="space-y-4">
                {personalInfo?.residence && (
                  <InfoRow
                    icon={Home}
                    label="Residence"
                    value={personalInfo?.residence}
                  />
                )}
                {personalInfo?.birth_place && (
                  <InfoRow
                    icon={MapPin}
                    label="Birth Place"
                    value={personalInfo?.birth_place}
                  />
                )}
                {personalInfo?.college && personalInfo?.college !== 'null' && (
                  <InfoRow
                    icon={GraduationCap}
                    label="College"
                    value={personalInfo?.college}
                  />
                )}
                {personalInfo?.rookie_year && (
                  <InfoRow
                    icon={Target}
                    label="Rookie Year"
                    value={personalInfo?.rookie_year}
                  />
                )}
                {personalInfo?.year_joined && (
                  <InfoRow
                    icon={Calendar}
                    label="Year Joined"
                    value={personalInfo?.year_joined}
                  />
                )}
                {personalInfo?.family && (
                  <InfoRow
                    icon={User}
                    label="Family"
                    value={personalInfo?.family}
                  />
                )}
                {p?.birthday && (
                  <InfoRow icon={Calendar} label="Birthday" value={p?.birthday} />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <User className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Personal details are not available for this player.
                </p>
              </div>
            )}
            </CardContent>
          </Card>

          {/* Earnings Card if available */}
          {(statistics?.official_money || statistics?.career_earnings) ? (
            <Card className="bg-primary/5 rounded-2xl border-border/50 border-primary/20 shadow-sm">
              <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Landmark className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Career Earnings</h3>
                  <p className="text-sm text-muted-foreground">
                    Total official prize money
                  </p>
                </div>
              </div>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-primary">
                  {formatMoney(
                    (statistics?.official_money || statistics?.career_earnings)?.value
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {p?.tour === 'pga'
                    ? 'PGA Tour Earnings'
                    : 'Official Earnings'}
                </div>
              </div>
              </CardContent>
            </Card>
          ) : ''}

          {/* Achievements Summary */}
          {(statistics?.wins || statistics?.top_10) ? (
            <Card className="bg-linear-to-br from-amber-500/5 to-amber-600/5 rounded-2xl border-border/50 border-amber-200 shadow-sm">
              <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <TrophyIcon className="size-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold">Key Achievements</h3>
                  <p className="text-sm text-muted-foreground">Career highlights</p>
                </div>
              </div>
              <div className="space-y-3">
                {statistics?.wins && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tour Wins</span>
                    <span className="font-bold text-amber-700">
                      {statistics.wins.value}
                    </span>
                  </div>
                )}
                {statistics?.top_10 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Top 10 Finishes
                    </span>
                    <span className="font-bold text-amber-700">
                      {statistics.top_10.value}
                    </span>
                  </div>
                )}
                {statistics?.second_place && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      2nd Place Finishes
                    </span>
                    <span className="font-bold">
                      {statistics.second_place.value}
                    </span>
                  </div>
                )}
              </div>
              </CardContent>
            </Card>
          ) : ''}
        </div>
      </div>

      {/* Empty State */}
      {!hasAnyData(p!) && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                <UserX className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">No Data Available</h3>

            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Detailed statistics and information are not available for this player at the moment.
              Please check back later for updated information.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-4">
              <Card className="border-border/50 bg-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold">Player profile pending</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Updates</p>
                  <p className="text-sm font-semibold">Check back soon</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const PersonalItem = ({
  value,
  icon: Icon,
  title,
}: {
  value: string | number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div className="gap-2 rounded-xl border border-border/50 shadow-sm">
      <div className="text-xs text-muted-foreground border-b border-border/40 px-3 py-1.5">{title}</div>
      <div className="flex items-center font-bold gap-2 py-1 px-3">
        <Icon className="size-4 text-primary" />
        {value}
      </div>
    </div>
  );
};
// Helper Components
type InfoRowProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 py-3 border-b last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-muted-foreground/10 rounded-lg">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <p className="font-semibold text-right">{value}</p>
  </div>
);

export type Tournament = {
  tournament_name: string;
  start_date: string;
  position: string;
  to_par?: string;
  score?: string;
  official_money_text?: string;
  official_money_amount?: number;
  points?: number | null;
  r1?: string | number | null;
  r2?: string | number | null;
  r3?: string | number | null;
  r4?: string | number | null;
  total?: number;
  cme_points?: number;
  liv_tournament_id?: string;
};

type TournamentTableProps = {
  tournaments?: Tournament[];
};

export const TournamentTable: React.FC<TournamentTableProps> = ({
  tournaments,
}) => {
  if (!tournaments || tournaments.length === 0) return null;

  const isLiv = tournaments.some(t => t.liv_tournament_id || t.points !== undefined);

  const getPositionColor = (position: string) => {
    if (position === '1' || position === 'W')
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (position?.includes('T') && !position.includes('T10'))
      return 'bg-amber-100 text-amber-800 border-amber-200';
    if (position === 'CUT' || position === 'WDC')
      return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 font-semibold text-sm">
                Tournament
              </th>
              <th className="text-left p-4 font-semibold text-sm">
                Date
              </th>
              <th className="text-left p-4 font-semibold text-sm">Pos</th>
              <th className="text-left p-4 font-semibold text-sm">
                Score
              </th>
              {isLiv && (
                <>
                  <th className="text-left p-4 font-semibold text-sm">R1</th>
                  <th className="text-left p-4 font-semibold text-sm">R2</th>
                  <th className="text-left p-4 font-semibold text-sm">R3</th>
                  <th className="text-left p-4 font-semibold text-sm">R4</th>
                </>
              )}
              <th className="text-left p-4 font-semibold text-sm">
                {isLiv ? 'Points' : 'Earnings'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {tournaments?.map((t, i) => (
              <tr key={i} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium">
                    {t.tournament_name || '-'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {t.start_date
                      ? new Date(t.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })
                      : '-'}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getPositionColor(t.position)}`}
                  >
                    {t?.position || '-'}
                  </span>
                </td>
                <td className="p-4">
                  {(() => {
                    const scoreVal = t?.to_par || t?.score;
                    return (
                      <div
                        className={`font-mono font-bold ${scoreVal?.startsWith?.('-')
                          ? 'text-emerald-600'
                          : scoreVal?.startsWith?.('+')
                            ? 'text-red-600'
                            : ''
                          }`}
                      >
                        {scoreVal || '-'}
                      </div>
                    );
                  })()}
                </td>
                {isLiv && (
                  <>
                    <td className="p-4"><div className="font-mono text-sm">{t?.r1 ?? '-'}</div></td>
                    <td className="p-4"><div className="font-mono text-sm">{t?.r2 ?? '-'}</div></td>
                    <td className="p-4"><div className="font-mono text-sm">{t?.r3 ?? '-'}</div></td>
                    <td className="p-4"><div className="font-mono text-sm">{t?.r4 ?? '-'}</div></td>
                  </>
                )}
                <td className="p-4">
                  <div className="font-medium">
                    {isLiv
                      ? (t?.points != null ? t.points : '-')
                      : (t?.official_money_text ||
                        (t?.official_money_amount
                          ? t?.official_money_amount.toLocaleString()
                          : '-'))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Functions
const getStatDisplay = (key: string, stat: { value: string | number | null; rank?: string }) => {
  const icons = {
    wins: Trophy,
    top_10: ListOrdered,
    top_25: List,
    official_money: Banknote,
    career_earnings: Landmark,
    starts: Flag,
    events_played: CalendarDays,
    pga_tour_wins: Trophy,
    pga_tour_champions_wins: Award,
    international_wins: Globe,
    second_place: Medal,
    third_place: ShieldCheckIcon,
    cuts_made: CheckCircle2,
    low_round: TrendingDown,
    cme_points: Star,
    cme_rank: Hash,
    fairway_hits: Target,
    birdies: Award,
    eagles: Trophy,
    scrambling: TrendingUp,
    greens_in_regulation: CheckCircle2,
    putting_average: Flag,
    driving_distance: Ruler,
  };

  const labels: Record<string, string> = {
    events_played: 'Events Played',
    cuts_made: 'Cuts Made',
    pga_tour_wins: 'PGA Tour Wins',
    pga_tour_champions_wins: 'Champions Wins',
    international_wins: 'International Wins',
    second_place: '2nd Place',
    third_place: '3rd Place',
    top_10: 'Top 10',
    top_25: 'Top 25',
    official_money: 'Official Money',
    career_earnings: 'Career Earnings',
    starts: 'Starts',
    low_round: 'Low Round',
    cme_rank: 'CME Rank',
    cme_points: 'CME Points',
    fairway_hits: 'Fairway Hits',
    birdies: 'Birdies',
    eagles: 'Eagles',
    scrambling: 'Scrambling',
    greens_in_regulation: 'Greens in Regulation',
    putting_average: 'Putting Average',
    driving_distance: 'Driving Distance',
  };

  const valueLabels: Record<string, string> = {
    events_played: 'Tot',
    cuts_made: 'Tot',
    pga_tour_wins: 'Tot',
    pga_tour_champions_wins: 'Tot',
    international_wins: 'Tot',
    second_place: 'Tot',
    third_place: 'Tot',
    top_10: 'Tot',
    top_25: 'Tot',
    wins: 'Tot',
    official_money: 'Earnings',
    career_earnings: 'Earnings',
    starts: 'Tot',
    low_round: 'Score',
    cme_rank: 'Rank',
    cme_points: 'Pts',
    fairway_hits: 'Acc',
    birdies: 'Tot',
    eagles: 'Tot',
    scrambling: 'Scram. %',
    greens_in_regulation: 'GIR %',
    putting_average: 'Avg',
    driving_distance: 'Avg yards',
  };

  return {
    label:
      labels[key] ||
      key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: formatStatValue(stat.value),
    valueLabel: valueLabels[key] || 'Value',
    rank: stat.rank,
    icon: icons[key as keyof typeof icons],
  };
};

const formatStatValue = (
  value: string | null | number | undefined
): string | number => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return value.toLocaleString();
  }
  if (typeof value === 'string' && value.includes('/')) return value;
  return value;
};

const formatMoney = (value: string | number | null | undefined): string => {
  if (!value) return '-';
  if (typeof value === 'number' && value === 0) return '-';
  if (typeof value === 'number') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  }
  return value === "0" ? "-" : value;
};


const hasAnyData = (player: UnifiedPlayer): boolean => {
  return (
    player?.age !== undefined ||
    player?.height !== undefined ||
    player?.weight !== undefined ||
    player?.residence !== undefined ||
    (player?.statistics && Object.keys(player?.statistics).length > 0) ||
    (player?.tournaments && player?.tournaments.length > 0) ||
    player?.starts !== undefined ||
    player?.wins !== undefined
  );
};

// Loading Skeleton Component
const PlayerDetailsSkeleton = () => {
  return (
    <div className="p-6 space-y-8 min-h-screen animate-in fade-in duration-300">
      {/* Back Button Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Header Section Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border-border/50 border p-6 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16">
          {/* Avatar Skeleton */}
          <div className="relative">
            <Skeleton className="size-44 rounded-full" />
          </div>

          {/* Player Info Skeleton */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Quick Stats Bar Skeleton */}
            <div className="flex flex-wrap gap-4 pt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="gap-2 rounded-xl border border-border/50 shadow-sm">
                  <div className="px-3 py-1.5 border-b border-border/40">
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-2 py-1 px-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Statistics & Tournaments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Statistics Card Skeleton */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="p-2 rounded-lg w-10 h-10" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/50 p-4 animate-in fade-in duration-300"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="p-2 rounded-lg w-9 h-9" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-7 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tournaments Table Skeleton */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="p-2 rounded-lg w-10 h-10" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="overflow-hidden rounded-xl border border-border/50">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        {['Tournament', 'Date', 'Pos', 'Score', 'Earnings'].map((header, i) => (
                          <th key={i} className="text-left p-4">
                            <Skeleton className="h-4 w-20" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="p-4"><Skeleton className="h-6 w-12 rounded-full" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Personal Info (1 col) */}
        <div className="space-y-6">
          {/* Personal Details Card Skeleton */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="p-2 rounded-lg w-10 h-10" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Skeleton className="p-2 rounded-lg w-8 h-8" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Earnings Card Skeleton */}
          <Card className="bg-primary/5 rounded-2xl border-border/50 border-primary/20 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="p-2 rounded-lg w-10 h-10" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="text-center py-4">
                <Skeleton className="h-9 w-32 mx-auto mb-2" />
                <Skeleton className="h-3 w-28 mx-auto" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card Skeleton */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="p-2 rounded-lg w-10 h-10" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
