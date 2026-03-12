import {
  ScoringMethod,
  TournamentLeaderBoardType,
  TournamentScore,
} from '@/lib/definitions';
import { useGameScore } from '@/lib/hooks/use-tournament/use-game-score';
import { useQuery } from '@apollo/client/react';
import { GetBestBallScoreByTeamPlayers } from '@/lib/hooks/use-tournament/_query';
import type { BestBallScoreByTeamPlayersData, BestBallScoreByTeamPlayersVar } from '@/lib/hooks/use-tournament/_interface';
import { useFetchGolfCourseCoordinates } from '@/lib/hooks/use-fetch-course';
import { Loader } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

export function ExpandableScoreCard({
  player,
  roundsLength,
  scoreMethod,
  scoresCache,
  setScoresCache,
  totalHoles = 18,
  bestBallTeamId,
  courseId,
}: {
  player: TournamentLeaderBoardType;
  roundsLength: number;
  scoreMethod: ScoringMethod;
  scoresCache: Record<string, Record<number, TournamentScore[]>>;
  setScoresCache: React.Dispatch<
    React.SetStateAction<Record<string, Record<number, TournamentScore[]>>>
  >;
  totalHoles?: number;
  bestBallTeamId?: string;
  courseId?: string;
}) {
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [side, setSide] = useState<'front' | 'back'>('front');

  const useBestBallApi = !!bestBallTeamId;

  // Standard score query (used for non-Best Ball)
  const { gameScore, status } = useGameScore({
    gameId: useBestBallApi ? undefined : player?.tournament_id,
    method: useBestBallApi ? undefined : scoreMethod,
    playerId: useBestBallApi ? undefined : player?.id,
    round: useBestBallApi ? undefined : selectedRound,
  });

  // Best Ball score query
  const bbScore = useQuery<BestBallScoreByTeamPlayersData, BestBallScoreByTeamPlayersVar>(
    GetBestBallScoreByTeamPlayers,
    {
      variables: {
        teamId: bestBallTeamId as string,
        playerId: player?.id as string,
        round: selectedRound,
      },
      skip: !useBestBallApi || !bestBallTeamId || !player?.id,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Fetch course scorecard for par values
  const { scorecardDetails } = useFetchGolfCourseCoordinates(courseId ?? '');

  const activeScores = useBestBallApi
    ? bbScore.data?.getBestBallScoreByTeamPlayers
    : gameScore;
  const isLoading = useBestBallApi ? bbScore.loading : status?.gameScore.loading;

  const roundsAvailable = useMemo(
    () => Array.from({ length: roundsLength }, (_, i) => i + 1),
    [roundsLength]
  );

  // Always update cache with latest API data
  useEffect(() => {
    if (!activeScores) return;
    setScoresCache((prev) => ({
      ...prev,
      [player?.id]: {
        ...(prev[player?.id] || {}),
        [selectedRound]: activeScores,
      },
    }));
  }, [selectedRound, activeScores]);

  const holes = useMemo(() => {
    const arr = scoresCache[player.id]?.[selectedRound] ?? [];
    return [...arr].sort((a, b) => a.hole - b.hole);
  }, [scoresCache, player.id, selectedRound]);

  // Build course par array from scorecard details
  const coursePar = useMemo(() => {
    if (!scorecardDetails) return undefined;
    // Use men_par_hole by default; if first scored hole has different par, it likely uses wmn
    return scorecardDetails.men_par_hole?.length
      ? scorecardDetails.men_par_hole
      : scorecardDetails.wmn_par_hole;
  }, [scorecardDetails]);

  return (
    <div className="p-3 border border-border/50 rounded-xl bg-muted/10 mt-2">
      {/* Round Selector */}
      <div className="flex justify-between items-center gap-2 mb-3">
        <p className="font-semibold">{player?.name}</p>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setSide('front')}
            className={`px-3 py-1 rounded ${
              side === 'front' ? 'bg-primary text-white' : 'bg-white border'
            }`}
          >
            Front
          </button>
          {totalHoles > 9 && (
            <button
              onClick={() => setSide('back')}
              className={`px-3 py-1 rounded ${
                side === 'back' ? 'bg-primary text-white' : 'bg-white border'
              }`}
            >
              Back
            </button>
          )}
        </div>

        <select
          className="border p-1 rounded"
          value={selectedRound}
          onChange={(e) => setSelectedRound(Number(e.target.value))}
        >
          {roundsAvailable.map((r) => (
            <option key={r} value={r}>
              Round {r}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader className="animate-spin" />
        </div>
      )}

      {/* Scorecard */}
      {!isLoading && (
        <GolfScoreCard
          scores={holes}
          side={side}
          totalHoles={totalHoles}
          scoreMethod={scoreMethod}
          coursePar={coursePar}
        />
      )}
    </div>
  );
}

function GolfScoreCard({
  scores,
  totalHoles,
  side,
  scoreMethod,
  coursePar,
}: {
  scores: TournamentScore[];
  totalHoles: number;
  side: 'front' | 'back';
  scoreMethod: ScoringMethod;
  coursePar?: number[];
}) {
  const safe = (val: string | number | undefined) =>
    val === null || val === undefined ? '-' : val;

  const holes = useMemo(() => {
    const arr = Array.from({ length: totalHoles }, (_, i) => i + 1);
    return side === 'front'
      ? arr.slice(0, Math.min(9, totalHoles))
      : arr.slice(9, totalHoles);
  }, [side, totalHoles]);

  const scoreMap: Record<number, TournamentScore | undefined> = {};
  scores.forEach((h) => (scoreMap[h.hole] = h));

  // Get par for a hole: prefer score data, fallback to course data
  const getParForHole = (holeNum: number): number | undefined => {
    if (scoreMap[holeNum]?.par != null) return scoreMap[holeNum]!.par;
    if (coursePar && coursePar[holeNum - 1] != null) return coursePar[holeNum - 1];
    return undefined;
  };

  const sumOf = (key: keyof TournamentScore) =>
    holes.reduce((acc, h) => {
      const val = scoreMap[h]?.[key];
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);

  // Par total uses course data for all holes
  const parTotal = holes.reduce((acc, h) => {
    const par = getParForHole(h);
    return acc + (typeof par === 'number' ? par : 0);
  }, 0);
  const grossTotal = sumOf('gross_score');
  const netTotal = sumOf('net_score');
  const grossPointsTotal = sumOf('gross_points');
  const netPointsTotal = sumOf('net_points');

  const cellBase = 'px-2 py-1.5 text-center';
  const headerCell = `${cellBase} font-semibold text-muted-foreground bg-primary text-white first:text-left`;
  const labelCell = `${cellBase} font-medium text-left text-foreground bg-muted/30 whitespace-nowrap`;
  const dataCell = `${cellBase} text-foreground`;
  const totalCell = `${cellBase} font-bold text-foreground bg-muted/20`;

  return (
    <div className="mt-3 overflow-x-auto pb-3 rounded-xl bg-background border border-border/50">
      <table className="min-w-max text-xs border-collapse w-full">
        <thead>
          {/* Hole row */}
          <tr>
            <th className={headerCell}>Hole</th>
            {holes.map((h) => (
              <th key={h} className={headerCell}>{h}</th>
            ))}
            <th className={headerCell}>Total</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border/30">
          {/* Par */}
          <tr>
            <td className={labelCell}>Par</td>
            {holes.map((h) => {
              const par = getParForHole(h);
              return <td key={h} className={dataCell}>{par != null ? par : '-'}</td>;
            })}
            <td className={totalCell}>{parTotal || '-'}</td>
          </tr>

          {/* Stroke Index */}
          <tr>
            <td className={labelCell}>Stroke Index</td>
            {holes.map((h) => (
              <td key={h} className={dataCell}>{safe(scoreMap[h]?.stroke_index)}</td>
            ))}
            <td className={totalCell} />
          </tr>

          {/* HCP Strokes */}
          <tr>
            <td className={labelCell}>HCP Strokes</td>
            {holes.map((h) => (
              <td key={h} className={dataCell}>{safe(scoreMap[h]?.hcp_strokes)}</td>
            ))}
            <td className={totalCell} />
          </tr>

          {/* Gross Score */}
          <tr>
            <td className={labelCell}>Gross Score</td>
            {holes.map((h) => (
              <td key={h} className={dataCell}>{safe(scoreMap[h]?.gross_score)}</td>
            ))}
            <td className={totalCell}>{grossTotal || '-'}</td>
          </tr>

          {/* Net Score */}
          <tr>
            <td className={labelCell}>Net Score</td>
            {holes.map((h) => (
              <td key={h} className={`${dataCell} relative`}>
                {getSymbol(scoreMap[h]?.net_score, getParForHole(h))}
                <span className="relative z-10">{safe(scoreMap[h]?.net_score)}</span>
              </td>
            ))}
            <td className={totalCell}>{netTotal || '-'}</td>
          </tr>

          {/* Gross Points (Stableford only) */}
          {scoreMethod === 'STABLEFORD' && (
            <tr>
              <td className={labelCell}>Gross Points</td>
              {holes.map((h) => (
                <td key={h} className={dataCell}>{safe(scoreMap[h]?.gross_points)}</td>
              ))}
              <td className={totalCell}>{grossPointsTotal || '-'}</td>
            </tr>
          )}

          {/* Net Points (Stableford only) */}
          {scoreMethod === 'STABLEFORD' && (
            <tr>
              <td className={labelCell}>Net Points</td>
              {holes.map((h) => (
                <td key={h} className={dataCell}>{safe(scoreMap[h]?.net_points)}</td>
              ))}
              <td className={totalCell}>{netPointsTotal || '-'}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 px-3 text-[11px] flex flex-wrap gap-4 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-500 opacity-40 inline-block" />
          Eagle
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full border border-gray-500 inline-block" />
          Birdie
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 border border-yellow-900 inline-block" />
          Bogey
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 bg-orange-400 inline-block" />
          Double Bogey+
        </div>
      </div>
    </div>
  );
}

export const getSymbol = (gross?: number, par?: number) => {
  if (gross == null || par == null) return null;
  const diff = gross - par;

  if (diff <= -2) {
    // Eagle
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-5 h-5 rounded-full bg-blue-500 opacity-30" />
      </span>
    );
  }
  if (diff === -1) {
    // Birdie
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border border-gray-500 opacity-60" />
      </span>
    );
  }
  if (diff === 1) {
    // Bogey
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-5 h-5 border border-yellow-900 opacity-60" />
      </span>
    );
  }
  if (diff >= 2) {
    // Double Bogey+
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-5 h-5 bg-orange-400 opacity-40" />
      </span>
    );
  }
  return null;
};
