"use client";

import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetContent,
} from "@/components/ui/sheet";
import { CaseAnalysisReport } from "./CaseAnalysisReport";
import type { CaseWithDocuments } from "@/app/_types/case";

type CaseDocumentsDrawerProps = {
  case: CaseWithDocuments | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  karta_wypadku: "Karta Wypadku",
  opinia: "Opinia",
  wyjasnienia_poszkodowanego: "Wyjaśnienia Poszkodowanego",
  zawiadomienie_o_wypadku: "Zawiadomienie o Wypadku",
  other: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function CaseDocumentsDrawer({
  case: caseData,
  open,
  onOpenChange,
}: CaseDocumentsDrawerProps) {
  if (!caseData) return null;

  const documentsByType = caseData.documents.reduce<
    Record<string, typeof caseData.documents>
  >((acc, doc) => {
    const type = doc.type ?? "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {});

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader>
        <SheetTitle>{caseData.name}</SheetTitle>
        <SheetClose onClick={() => onOpenChange(false)} />
      </SheetHeader>

      <SheetContent>
        <div className="space-y-6">
          {caseData.description && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Description
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {caseData.description}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              AI Analysis Report
            </h3>
            <CaseAnalysisReport caseId={caseData.id} />
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Documents ({caseData.documents.length})
            </h3>

            {caseData.documents.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No documents uploaded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(documentsByType).map(([type, docs]) => (
                  <div key={type}>
                    <h4 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {DOCUMENT_TYPE_LABELS[type] ?? type}
                    </h4>
                    <div className="space-y-3">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                                {doc.name}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {formatDate(doc.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                STATUS_COLORS[doc.status ?? "pending"]
                              }`}
                            >
                              {STATUS_LABELS[doc.status ?? "pending"]}
                            </span>
                          </div>

                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View Document
                              <svg
                                className="ml-1 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Case created: {formatDate(caseData.createdAt)}
            </p>
            {caseData.updatedAt &&
              caseData.updatedAt !== caseData.createdAt && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Last updated: {formatDate(caseData.updatedAt)}
                </p>
              )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
