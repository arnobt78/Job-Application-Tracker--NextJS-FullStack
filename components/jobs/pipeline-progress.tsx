'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Human-readable labels for each pipeline agent step */
const STEP_LABELS: Record<string, string> = {
  'job-extractor': 'Extracting job details',
  'job-analyzer': 'Analysing role requirements',
  'job-preprocessor': 'Building context blocks',
  'job-optimizer': 'Optimising output plan',
  'job-synthesizer': 'Generating AI content',
  'job-validator': 'Validating results',
  'job-assembler': 'Assembling insights',
  'view-formatter': 'Formatting response',
  'final-verifier': 'Verifying quality',
};

const ORDERED_STEPS = Object.keys(STEP_LABELS);

type PipelineProgressProps = {
  /** The agent step currently executing (step name from SSE event) */
  currentStep: string | null;
  /** Agent steps that have already completed */
  completedSteps: string[];
};

/** Animated 9-step pipeline progress list shown during AI generation */
export function PipelineProgress({ currentStep, completedSteps }: PipelineProgressProps) {
  return (
    <div className="flex flex-col gap-1.5 py-1" role="status" aria-label="AI pipeline progress">
      {ORDERED_STEPS.map((step) => {
        const isCompleted = completedSteps.includes(step);
        const isCurrent = step === currentStep && !isCompleted;
        const isPending = !isCompleted && !isCurrent;

        return (
          <div
            key={step}
            className={cn(
              'flex items-center gap-2.5 text-xs transition-opacity duration-300',
              isPending && !currentStep ? 'opacity-40' : 'opacity-100',
              isPending && currentStep ? 'opacity-30' : ''
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
            ) : isCurrent ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" aria-hidden />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" aria-hidden />
            )}
            <span
              className={cn(
                'font-medium transition-colors',
                isCompleted && 'text-muted-foreground line-through decoration-muted-foreground/30',
                isCurrent && 'text-foreground',
                isPending && 'text-muted-foreground/50'
              )}
            >
              {STEP_LABELS[step] ?? step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
