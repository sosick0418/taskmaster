"use client"

import { motion } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeToggle } from "./theme-toggle"
import { UserButton } from "@/components/auth/user-button"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function Header() {
  return (
    <TooltipProvider>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 flex h-16 items-center justify-end border-b border-border bg-background/80 px-6 backdrop-blur-xl"
      >
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
