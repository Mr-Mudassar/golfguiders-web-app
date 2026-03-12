import { Button } from '@/components/ui';
import type {
  TournamentOverviewList,
  TournamentScore,
  TournamentScoreInput,
} from '@/lib/definitions';
import { useGameScore } from '@/lib/hooks/use-tournament/use-game-score';
import React from 'react';
import { toast } from 'sonner';

type Props = {
  selectedPlayer: TournamentOverviewList;
  payload: TournamentScoreInput;
  score: number | '';
  setScore: (value: number | '') => void;
  setAnim: (val: boolean) => void;
  setOverlayText: (value: string | null) => void;
  scoreLabel: string;
  setScoreLabel: (value: string | null) => void;
  setHole: (val: number) => void;
  setRound: (val: number) => void;
  fetchState: () => Promise<void>;
  onMatchCompleted?: () => void;
};

/** Build a payload from an existing TournamentScore so we can re-submit it */
function toInput(s: TournamentScore, base: TournamentScoreInput): TournamentScoreInput {
  return {
    ...base,
    hole: s.hole,
    round: s.round,
    gross_score: s.gross_score,
    par: s.par,
    stroke_index: s.stroke_index,
    hcp: s.hcp,
    name: s.name || base.name,
    player_id: s.player_id || base.player_id,
    team_id: s.team_id || base.team_id,
  };
}

export const AddScoreButton = ({
  setAnim,
  score,
  setHole,
  setRound,
  payload,
  selectedPlayer,
  setOverlayText,
  scoreLabel,
  setScoreLabel,
  setScore,
  fetchState,
  onMatchCompleted,
}: Props) => {
  const { tournamentScore, gameScore, status } = useGameScore({
    gameId: selectedPlayer?.tournament_id,
    playerId: selectedPlayer?.id,
    round: payload?.round,
    method: payload?.tournament_scoring_method,
  });

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      toast('Select a player first');
      return;
    }
    if (score === '' || Number.isNaN(Number(score))) {
      toast('Enter score (1-20)');
      return;
    }

    if (!payload.tournament_id) {
      console.error('Missing player_id or tournament_id', payload);
      return;
    }

    // Show overlay immediately — don't wait for API
    setAnim(true);
    setOverlayText(scoreLabel || `Score ${score}`);
    setScore('');
    setScoreLabel(null);
    setTimeout(() => setAnim(false), 700);
    setTimeout(() => setOverlayText(null), 1500);

    // Collect subsequent scores BEFORE submitting (backend deletes them on re-submit)
    const subsequentScores: TournamentScore[] = (gameScore ?? [])
      .filter((s) => s.round === payload.round && s.hole > payload.hole)
      .sort((a, b) => a.hole - b.hole);

    setSubmitting(true);
    try {
      const res = await tournamentScore({
        variables: { scoreInput: payload },
      });
      const newScore = res?.data?.addTournamentScore;

      if (newScore) {
        // Re-submit subsequent scores that the backend deleted
        for (const s of subsequentScores) {
          await tournamentScore({
            variables: { scoreInput: toInput(s, payload) },
          });
        }

        const maxRounds = Number(newScore.tournament_rounds);
        const maxHoles = newScore.tournament_holes;

        // Determine effective last hole after re-submits
        const lastResubmitted = subsequentScores.length > 0
          ? subsequentScores[subsequentScores.length - 1]
          : null;
        const effectiveHole = lastResubmitted ? lastResubmitted.hole : newScore.hole;
        const effectiveRound = lastResubmitted ? lastResubmitted.round : newScore.round;

        const isLastScore = effectiveHole >= maxHoles && effectiveRound >= maxRounds;

        // Skip refetch on last hole — backend returns 503 when match is complete
        if (isLastScore) {
          onMatchCompleted?.();
        } else {
          await fetchState?.();
        }

        // Advance to the next unplayed hole
        let nextHole = effectiveHole;
        let nextRound = effectiveRound;
        if (nextHole < maxHoles) {
          nextHole += 1;
        } else {
          if (nextRound < maxRounds) {
            nextRound += 1;
            nextHole = 1;
          } else {
            nextHole = maxHoles;
            nextRound = maxRounds;
          }
        }

        setHole(nextHole);
        setRound(nextRound);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const loading = status?.tournament?.loading || submitting;

  return (
    <Button
      loading={loading}
      disabled={!score || loading}
      size="xl"
      className="w-full text-lg disabled:bg-muted disabled:text-muted-foreground"
      onClick={handleSubmit}
    >
      Add Score
    </Button>
  );
};
