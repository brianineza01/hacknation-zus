"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type WizardNavigationProps = {
  currentStep: number
  totalSteps: number
  canContinue: boolean
  canSkip?: boolean
  isStepCompleted?: boolean
  isSubmitting?: boolean
  onBack: () => void
  onContinue: () => void
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canContinue,
  canSkip = false,
  isStepCompleted = false,
  isSubmitting = false,
  onBack,
  onContinue,
}: WizardNavigationProps) {
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const handleSkipClick = () => {
    if (!isStepCompleted) {
      setShowSkipWarning(true)
    }
  }

  const confirmSkip = () => {
    setShowSkipWarning(false)
    onContinue()
  }

  const cancelSkip = () => {
    setShowSkipWarning(false)
  }

  return (
    <div className="space-y-4">
      {showSkipWarning && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Skip Witness Statement?
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Witness statements can strengthen your case. Are you sure you want to continue without uploading this document?
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelSkip}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={confirmSkip}
            >
              Skip Anyway
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
        >
          Back
        </Button>
        <div className="flex gap-2">
          {canSkip && !isStepCompleted && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipClick}
              disabled={isSubmitting}
            >
              Skip (Optional)
            </Button>
          )}
          <Button
            type="button"
            onClick={onContinue}
            disabled={!canContinue || isSubmitting}
          >
            {isSubmitting
              ? "Creating..."
              : isLastStep
              ? "Create Case"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}

