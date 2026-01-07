"use client"

import { motion } from "framer-motion"
import { Search, Command } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeToggle } from "./theme-toggle"
import { UserButton } from "@/components/auth/user-button"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface HeaderProps {
  onSearchOpen?: () => void
}

export function Header({ onSearchOpen }: HeaderProps) {
  return (
    <TooltipProvider>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl"
      >
        {/* Search bar */}
        <button
          onClick={onSearchOpen}
          className="group flex h-10 w-full max-w-md cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 text-left transition-all duration-300 hover:border-border/80 hover:bg-muted"
        >
          <Search className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground/60" />
          <span className="flex-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground/70">
            Search tasks...
          </span>
          <kbd className="hidden items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationBell />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User button */}
          <UserButton />
        </div>
      </motion.header>
    </TooltipProvider>
  )
}
