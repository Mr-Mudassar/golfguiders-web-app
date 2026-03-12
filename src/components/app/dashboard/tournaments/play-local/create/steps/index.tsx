import { Tabs, TabsContent, Button } from '@/components/ui';
import OrganizersStep from './organizers';
import BasicInfoStep from './basic-info';
import { RoundsForm } from './rounds';
import PlayersStep from './players';
import TeamsStep from './teams';
import ScorePermissionsStep from './score-permission';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import type { TournamentFormValues } from '..';
import { tournamentSchema } from '..';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const FormSteps = ({
  loading,
  initialData,
}: {
  loading: boolean;
  initialData: TournamentFormValues;
}) => {
  const { watch, handleSubmit, getValues } = useFormContext<TournamentFormValues>();
  const [step, setStep] = useState('0');
  const [isValid, setIsValid] = useState(false);

  const teamMatch =
    watch('scoring_method') === 'SCRAMBLE' ||
    watch('scoring_method') === 'BESTBALL';

  const showRounds = Number(watch('rounds')) > 1;
  const showTeams = teamMatch;
  const showPlayers = !teamMatch;

  const dynamicSteps = [
    { value: '0', show: true, label: 'Organizer', desc: 'Organizer Information', optional: false },
    { value: '1', show: true, label: 'Basic', desc: 'Basic Information', optional: false },
    { value: '2', show: showRounds, label: 'Rounds', desc: 'Round Scheduling', optional: false },
    { value: '3', show: showPlayers, label: 'Players', desc: 'Manage Players', optional: false },
    { value: '4', show: showTeams, label: 'Teams', desc: 'Manage Teams', optional: false },
    { value: '5', show: true, label: 'Permissions', desc: 'Score Permissions (Optional)', optional: true },
  ].filter((s) => s.show);

  const currentIndex = dynamicSteps.findIndex((s) => s.value === step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === dynamicSteps.length - 1;
  const isAllValid = tournamentSchema.safeParse(getValues()).success;
  const nextStepItem = currentIndex < dynamicSteps.length - 1 ? dynamicSteps[currentIndex + 1] : null;
  const isNextStepOptional = nextStepItem?.optional === true;

  const nextStep = () => {
    if (currentIndex < dynamicSteps.length - 1) setStep(dynamicSteps[currentIndex + 1].value);
  };

  const prevStep = () => {
    if (currentIndex > 0) setStep(dynamicSteps[currentIndex - 1].value);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <Tabs value={step} onValueChange={setStep} className="flex flex-col h-full min-h-0">

        {/* Step progress indicator */}
        <div className="shrink-0 px-4 pt-4 pb-3 bg-background border-b border-border/60">
          {/* Step title */}
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Step {currentIndex + 1} of {dynamicSteps.length}
            {' · '}
            <span className="text-primary">
              {dynamicSteps[currentIndex]?.desc}
            </span>
          </p>

          {/* Visual stepper */}
          <div className="flex items-center">
            {dynamicSteps.map((s, i) => {
              const isDone = i < currentIndex;
              const isCurrent = i === currentIndex;

              return (
                <div key={s.value} className="flex items-center flex-1 last:flex-none">
                  {/* Step circle */}
                  <button
                    type="button"
                    onClick={() => (isDone || (initialData && isCurrent)) ? setStep(s.value) : undefined}
                    className={cn(
                      'flex flex-col items-center gap-0.5 group',
                      (isDone || initialData) ? 'cursor-pointer' : 'cursor-default'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                        isDone
                          ? 'bg-primary text-white shadow-sm shadow-primary/30'
                          : isCurrent
                            ? 'bg-primary/15 text-primary border-2 border-primary'
                            : 'bg-muted text-muted-foreground/50 border border-border'
                      )}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span
                      className={cn(
                        'text-[9px] font-semibold whitespace-nowrap text-center',
                        isCurrent
                          ? 'text-primary'
                          : isDone
                            ? 'text-primary/60'
                            : 'text-muted-foreground/40'
                      )}
                    >
                      {s.label}
                      {s.optional && (
                        <span className="block text-[8px] font-normal text-muted-foreground/50 -mt-0.5">opt</span>
                      )}
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < dynamicSteps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-1.5 mb-4 rounded-full transition-all duration-300',
                        isDone ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            <TabsContent value="0" className="m-0">
              <OrganizersStep setValid={setIsValid} />
            </TabsContent>
            <TabsContent value="1" className="m-0">
              <BasicInfoStep setValid={setIsValid} edit={Boolean(!!initialData)} />
            </TabsContent>
            <TabsContent value="2" className="m-0">
              <RoundsForm setValid={setIsValid} />
            </TabsContent>
            <TabsContent value="3" className="m-0">
              <PlayersStep setValid={setIsValid} />
            </TabsContent>
            <TabsContent value="4" className="m-0">
              <TeamsStep setValid={setIsValid} />
            </TabsContent>
            <TabsContent value="5" className="m-0">
              <ScorePermissionsStep />
            </TabsContent>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border/60 bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={isFirstStep}
            className="gap-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {isLastStep ? (
              <Button
                type="submit"
                loading={loading}
                disabled={!isAllValid || loading}
                className="px-7 h-10 font-semibold shadow-sm shadow-primary/20"
              >
                {loading ? 'Processing...' : initialData ? 'Update Tournament' : 'Create Tournament'}
              </Button>
            ) : isNextStepOptional ? (
              <>
                <Button
                  type="submit"
                  variant="outline"
                  loading={loading}
                  disabled={!isAllValid || loading}
                  className="gap-1.5 h-11 px-5 text-muted-foreground border-border/60 font-semibold rounded-xl"
                >
                  {loading ? 'Processing...' : (
                    <span className="flex flex-col items-center">
                      <span className="text-[13px] leading-none">{initialData ? 'Update Tournament' : 'Create Tournament'}</span>
                      <span className="text-[10px] leading-none font-normal opacity-70 mt-0.5">skip permissions</span>
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextStep(); }}
                  className="gap-1.5 h-11 px-6 shadow-sm shadow-primary/20 rounded-xl font-semibold"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={!isValid}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextStep(); }}
                className="gap-2 px-6 h-10 font-semibold shadow-sm shadow-primary/20"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default FormSteps;
