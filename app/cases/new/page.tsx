"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardProgress } from "./_components/WizardProgress";
import { CaseInfoStep } from "./_components/CaseInfoStep";
import { DocumentUploadStep } from "./_components/DocumentUploadStep";
import { SupportingDocumentsStep } from "./_components/SupportingDocumentsStep";
import { WizardNavigation } from "./_components/WizardNavigation";
import { WIZARD_STEPS } from "@/app/_constants/wizard";
import { createCaseWithDocuments } from "@/app/_actions/case";
import type { UploadedDocument, PrimaryFormType } from "@/app/_types/case";

export default function NewCasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [primaryForms, setPrimaryForms] = useState<
    Record<PrimaryFormType, UploadedDocument | null>
  >({
    zawiadomienie_o_wypadku: null,
    zapis_wyjasnien_poszkodowanego: null,
    zapis_informacji_od_swiadka: null,
  });
  const [supportingDocuments, setSupportingDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = WIZARD_STEPS[currentStep];
  const isCaseInfoStep = currentStepData?.stepType === "info";
  const isPrimaryFormStep = currentStepData?.stepType === "primary";
  const isSupportingDocStep = currentStepData?.stepType === "supporting";

  const canContinue = () => {
    if (isCaseInfoStep) {
      return caseName.trim().length > 0;
    }
    if (isPrimaryFormStep && currentStepData?.documentType) {
      const isUploaded =
        primaryForms[currentStepData.documentType as PrimaryFormType] !== null;
      const isOptional =
        "optional" in currentStepData && currentStepData.optional === true;
      return isUploaded || isOptional;
    }
    if (isSupportingDocStep) {
      return true;
    }
    return false;
  };

  const canSkip = () => {
    return (
      isPrimaryFormStep &&
      "optional" in currentStepData &&
      currentStepData.optional === true
    );
  };

  const isStepCompleted = () => {
    if (isPrimaryFormStep && currentStepData?.documentType) {
      return (
        primaryForms[currentStepData.documentType as PrimaryFormType] !== null
      );
    }
    return false;
  };

  const handlePrimaryFormUpload = (document: UploadedDocument | null) => {
    if (currentStepData?.documentType) {
      setPrimaryForms((prev) => ({
        ...prev,
        [currentStepData.documentType as PrimaryFormType]: document,
      }));
    }
  };

  const handlePrimaryFormDataUpdate = (data: Record<string, unknown>) => {
    if (currentStepData?.documentType) {
      setPrimaryForms((prev) => {
        const currentDoc =
          prev[currentStepData.documentType as PrimaryFormType];
        if (currentDoc) {
          return {
            ...prev,
            [currentStepData.documentType as PrimaryFormType]: {
              ...currentDoc,
              extractedData: data,
            },
          };
        }
        return prev;
      });
    }
  };

  const handleSupportingDocUpload = (document: UploadedDocument) => {
    setSupportingDocuments((prev) => [...prev, document]);
  };

  const handleRemoveSupportingDoc = (key: string) => {
    setSupportingDocuments((prev) => prev.filter((doc) => doc.key !== key));
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = async () => {
    if (!canContinue()) return;

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const documents: UploadedDocument[] = [];

      Object.values(primaryForms).forEach((doc) => {
        if (doc) {
          documents.push(doc);
        }
      });

      documents.push(...supportingDocuments);

      const result = await createCaseWithDocuments({
        name: caseName,
        description: caseDescription,
        documents,
      });

      if (result.success && result.data) {
        router.push("/");
      } else {
        console.error("Failed to create case:", result.error);
        alert("Failed to create case. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting case:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Case</h1>
          <p className="text-muted-foreground mt-2">
            Follow the steps below to create a case and upload all required
            documents.
          </p>
        </div>

        <WizardProgress currentStep={currentStep} />

        <div className="min-h-[400px]">
          {isCaseInfoStep && (
            <CaseInfoStep
              name={caseName}
              description={caseDescription}
              onNameChange={setCaseName}
              onDescriptionChange={setCaseDescription}
            />
          )}

          {isPrimaryFormStep && currentStepData?.documentType && (
            <DocumentUploadStep
              title={currentStepData.title}
              documentType={currentStepData.documentType as PrimaryFormType}
              uploadedDocument={
                primaryForms[currentStepData.documentType as PrimaryFormType] ??
                null
              }
              onUploadComplete={handlePrimaryFormUpload}
              onDataUpdate={handlePrimaryFormDataUpdate}
              optional={
                "optional" in currentStepData ? currentStepData.optional : false
              }
            />
          )}

          {isSupportingDocStep && (
            <SupportingDocumentsStep
              uploadedDocuments={supportingDocuments}
              onUploadComplete={handleSupportingDocUpload}
              onRemoveDocument={handleRemoveSupportingDoc}
            />
          )}
        </div>

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          canContinue={canContinue()}
          canSkip={canSkip()}
          isStepCompleted={isStepCompleted()}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
