"use client";

import { useEffect, useState } from "react";
import { getCaseAnalysis } from "@/app/_actions/case";
import type { CaseAnalysis, SimilarCase } from "@/app/_types/case";

type CaseAnalysisReportProps = {
  caseId: string;
};

export function CaseAnalysisReport({ caseId }: CaseAnalysisReportProps) {
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getCaseAnalysis(caseId);
      if (result.success) {
        setAnalysis(result.data ?? null);
      } else {
        setError(result.error ?? "Failed to fetch analysis");
      }
      setIsLoading(false);
    };

    fetchAnalysis();
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50" />
          <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400">
            Loading AI analysis...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-amber-600 dark:text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Analysis in progress
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              The AI analysis for this case is still processing. Please check
              back in a few moments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const similarCases: SimilarCase[] = JSON.parse(analysis.similarCases);
  const duplicateFlags = analysis.duplicateFlags
    ? JSON.parse(analysis.duplicateFlags)
    : null;
  const suggestedOutcomes = analysis.suggestedOutcomes
    ? JSON.parse(analysis.suggestedOutcomes)
    : [];

  return (
    <div className="space-y-6">
      {duplicateFlags?.isDuplicate && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Potential Duplicate Detected
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                Confidence: {(duplicateFlags.confidence * 100).toFixed(1)}%
              </p>
              {duplicateFlags.reason && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {duplicateFlags.reason}
                </p>
              )}
              {duplicateFlags.matchedCaseId && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Matched Case: {duplicateFlags.matchedCaseId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          AI Analysis Summary
        </h3>
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {analysis.analysis}
          </p>
        </div>
      </div>

      {similarCases.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Similar Cases ({similarCases.length})
          </h3>
          <div className="space-y-4">
            {similarCases.map((similarCase, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {similarCase.caseName}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Case ID: {similarCase.caseId}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {(similarCase.score * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {similarCase.summary}
                </p>
                {similarCase.matchedDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {similarCase.matchedDocuments.map((doc, docIdx) => (
                      <span
                        key={docIdx}
                        className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestedOutcomes.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Suggested Outcomes
          </h3>
          <div className="space-y-3">
            {suggestedOutcomes.map(
              (
                outcome: {
                  outcome: string;
                  confidence: number;
                  reasoning: string;
                },
                idx: number
              ) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {outcome.outcome}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${outcome.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {(outcome.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {outcome.reasoning}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
