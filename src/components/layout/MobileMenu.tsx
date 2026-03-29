'use client'

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types"

type Props = {
  role: UserRole | undefined
  isLoggedIn: boolean
  logoutAction: () => Promise<void>
}

export default function MobileMenu({ role, isLoggedIn, logoutAction }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="sm:hidden rounded-md p-2 text-primary hover:bg-surface-level-2 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        inert={!open ? "" : undefined}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-64 bg-surface-level-1 border-l border-primary shadow-xl transition-transform duration-300 sm:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-primary px-4 py-4 shrink-0">
          <span className="heading-7 text-primary">TrialAxis</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1 text-secondary hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {role === "cro" && (
            <>
              <Link href="/cro/projects" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Study Portfolio
                </Button>
              </Link>
              <Link href="/cro/projects/new" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  New Study
                </Button>
              </Link>
            </>
          )}
          {role === "clinic_admin" && (
            <>
              <Link href="/clinic/profile" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  My Profile
                </Button>
              </Link>
              <Link href="/clinic/inquiries" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Inquiries
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Log out */}
        {isLoggedIn && (
          <div className="shrink-0 border-t border-primary p-3">
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit" className="w-full">
                Log out
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
