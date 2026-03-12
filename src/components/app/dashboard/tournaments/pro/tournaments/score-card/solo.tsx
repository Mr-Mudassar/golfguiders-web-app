import React, { useMemo, useState } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { ProScoreHoles } from '../../_interface';
import { ScoreBadge } from './stroke';
import { teeColor } from '../_utils';

interface IndividualScoreCardProps {
  data: {
    rounds: ProScoreHoles[];
  };
  playerName: string;
  // totalScore: number;
  // totalPar: number;
}

export const IndividualScoreCard: React.FC<IndividualScoreCardProps> = ({
  data,
  playerName,
}) => {
  const [round, setRound] = useState('0');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [activeHole, setActiveHole] = useState<number | null>(1);
  const [viewMode, setViewMode] = useState<'score' | 'stats'>('score');
  const [hoveredHole, setHoveredHole] = useState<number | null>(null);

  const rounds = data.rounds;
  const holes = rounds?.[Number(round)]?.holes;

  const visibleHoles = useMemo(() => {
    return side === 'front' ? holes?.slice(0, 9) : holes?.slice(9, 18);
  }, [holes, side]);

  if (!holes?.length) {
    return <div>No score data</div>;
  }

  const activeHoleData =
    activeHole !== null
      ? holes?.find((h) => h.hole_number === activeHole)
      : null;

  const totalRound = holes?.reduce((sum, h) => sum + (Number(h.score) || 0), 0);
  const totalPar = holes?.reduce((sum, h) => sum + (Number(h?.par) || 0), 0);

  return (
    <div className="space-y-4 p-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={side === 'front' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSide('front')}
          >
            Front 9
          </Button>
          <Button
            variant={side === 'back' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSide('back')}
          >
            Back 9
          </Button>
        </div>
        <Select value={round} onValueChange={setRound}>
          <SelectTrigger className="w-32">
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

      {viewMode === 'score' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm p-2">
            <thead>
              <tr className="border-b text-foreground">
                <th className="text-left p-2">Hole</th>
                {visibleHoles?.map((h) => (
                  <th
                    key={h.hole_number}
                    onClick={() => setActiveHole(h.hole_number)}
                    className={`text-center p-2 min-w-12 cursor-pointer transition-colors ${activeHole === h.hole_number
                      ? 'bg-primary/10 font-bold'
                      : 'hover:bg-muted'
                      }`}
                  >
                    {h.hole_number}
                  </th>
                ))}
                <th className="text-center p-2">
                  {side === 'front' ? 'Out' : 'In'}
                </th>
                <th className="text-center p-2">TOT</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b">
              <tr>
                <td className="p-2">Par</td>
                {visibleHoles?.map((h) => (
                  <td
                    onClick={() => setActiveHole(h.hole_number)}
                    className={`text-center p-2 min-w-12 cursor-pointer transition-colors ${activeHole === h.hole_number
                      ? 'bg-primary/5 font-bold'
                      : 'hover:bg-muted'
                      }`}
                    key={h.hole_number}
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
                <td className="p-2">Score</td>
                {visibleHoles?.map((h) => (
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
                ))}
                <td className="text-center p-2 font-bold">
                  {visibleHoles?.reduce(
                    (sum, h) => sum + (Number(h.score) || 0),
                    0
                  )}
                </td>
                <td className="text-center p-2 font-bold">{totalRound}</td>
              </tr>
              <tr>
                <td className="p-2">Status</td>
                {visibleHoles?.map((h) => (
                  <td
                    onClick={() => setActiveHole(h.hole_number)}
                    className={`text-center relative group p-2 min-w-12 cursor-pointer transition-colors ${activeHole === h.hole_number
                      ? 'bg-primary/10 font-bold'
                      : 'hover:bg-muted'
                      }`}
                    key={h.hole_number}
                  >
                    {h.round_score}
                  </td>
                ))}
                <td className="text-center">-</td>
                <td
                  className={`text-center p-2 font-bold ${totalRound - totalPar < 0 ? 'text-destructive' : 'text-primary'}`}
                >
                  {totalRound - totalPar}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        'No Stats available'
      )}
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
                {Number(activeHoleData.score ?? activeHoleData?.team_score) -
                  activeHoleData.par >
                  0
                  ? '+'
                  : ''}
                {Number(activeHoleData.score ?? activeHoleData?.team_score) -
                  activeHoleData.par}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
