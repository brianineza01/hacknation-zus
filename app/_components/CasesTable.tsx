"use client"

import type { CaseWithDocuments } from "@/app/_types/case"

type CasesTableProps = {
  cases: CaseWithDocuments[]
  onCaseClick: (caseData: CaseWithDocuments) => void
}

export function CasesTable({ cases, onCaseClick }: CasesTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (cases.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-950">
        <svg
          className="mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          No cases yet
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Get started by creating your first case.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Case Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Documents
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {cases.map((caseData) => (
            <tr
              key={caseData.id}
              onClick={() => onCaseClick(caseData)}
              className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {caseData.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {caseData.description ?? "No description"}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {caseData.documents.length} {caseData.documents.length === 1 ? "document" : "documents"}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(caseData.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

