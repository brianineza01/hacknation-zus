"use client";

import { Progress } from "@/components/ui/progress";
import { WIZARD_STEPS } from "@/app/_constants/wizard";

type WizardProgressProps = {
  currentStep: number;
};

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const totalSteps = WIZARD_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = WIZARD_STEPS[currentStep];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <div className="text-right">
          <div className="text-muted-foreground">{currentStepData?.title}</div>
          {"description" in currentStepData && currentStepData.description && (
            <div className="text-xs text-muted-foreground">
              {currentStepData.description}
            </div>
          )}
        </div>
      </div>
      <Progress value={progress} />
      <div className="flex items-center justify-between gap-2">
        {WIZARD_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex-1 text-center text-xs ${
              index <= currentStep
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {step.title}
          </div>
        ))}
      </div>
    </div>
  );
}
