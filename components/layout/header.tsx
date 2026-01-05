"use client"

import { motion } from "framer-motion"
import { Search, LayoutList, LayoutGrid, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "./theme-toggle"
import { UserButton } from "@/components/auth/user-button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  view: "list" | "board"
  onViewChange: (view: "list" | "board") => void
  onSearchOpen?: () => void
}

export function Header({ view, onViewChange, onSearchOpen }: HeaderProps) {
  return (
    <TooltipProvider>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-black/20 px-6 backdrop-blur-xl"
      >
        {/* Search bar */}
        <button
          onClick={onSearchOpen}
          className="group flex h-10 w-full max-w-md items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-left transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
        >
          <Search className="h-4 w-4 text-white/40 transition-colors group-hover:text-white/60" />
          <span className="flex-1 text-sm text-white/40 transition-colors group-hover:text-white/50">
            Search tasks...
          </span>
          <kbd className="hidden items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-white/40 sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange("list")}
                  className={cn(
                    "h-7 w-7 rounded-md transition-all",
                    view === "list"
                      ? "bg-white/[0.1] text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                  )}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange("board")}
                  className={cn(
                    "h-7 w-7 rounded-md transition-all",
                    view === "board"
                      ? "bg-white/[0.1] text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Board view</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Board view</TooltipContent>
            </Tooltip>
          </div>

          <div className="mx-2 h-6 w-px bg-white/[0.08]" />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User button */}
          <UserButton />
        </div>
      </motion.header>
    </TooltipProvider>
  )
}
