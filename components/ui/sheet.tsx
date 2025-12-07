"use client"

import { type ReactNode } from "react"

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl animate-slide-in-right bg-white shadow-2xl dark:bg-zinc-900">
        {children}
      </div>
    </div>
  )
}

type SheetHeaderProps = {
  children: ReactNode
}

export function SheetHeader({ children }: SheetHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      {children}
    </div>
  )
}

type SheetTitleProps = {
  children: ReactNode
}

export function SheetTitle({ children }: SheetTitleProps) {
  return (
    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
      {children}
    </h2>
  )
}

type SheetCloseProps = {
  onClick: () => void
}

export function SheetClose({ onClick }: SheetCloseProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  )
}

type SheetContentProps = {
  children: ReactNode
}

export function SheetContent({ children }: SheetContentProps) {
  return (
    <div className="overflow-y-auto px-6 py-6">
      {children}
    </div>
  )
}

