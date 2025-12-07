"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CasesTable } from "@/app/_components/CasesTable"
import { CaseDocumentsDrawer } from "@/app/_components/CaseDocumentsDrawer"
import { getAllCasesWithDocuments } from "@/app/_actions/case"
import type { CaseWithDocuments } from "@/app/_types/case"

export default function Home() {
  const [cases, setCases] = useState<CaseWithDocuments[]>([])
  const [selectedCase, setSelectedCase] = useState<CaseWithDocuments | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true)
      const result = await getAllCasesWithDocuments()
      if (result.success && result.data) {
        setCases(result.data)
      }
      setIsLoading(false)
    }

    fetchCases()
  }, [])

  const handleCaseClick = (caseData: CaseWithDocuments) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedCase(null), 300)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Cases
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and view all your cases
            </p>
          </div>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Create New Case
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading cases...
              </p>
            </div>
          </div>
        ) : (
          <CasesTable cases={cases} onCaseClick={handleCaseClick} />
        )}
      </div>

      <CaseDocumentsDrawer
        case={selectedCase}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
      />
    </div>
  )
}
