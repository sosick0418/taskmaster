"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useSidebar } from "@/hooks/use-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed, toggle, isLoaded: sidebarLoaded } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until client-side hydration is complete
  if (!mounted || !sidebarLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-violet-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient orbs */}
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/5 blur-[100px]" />

        {/* Grid pattern */}
        <div className="grid-pattern absolute inset-0" />

        {/* Noise overlay */}
        <div className="noise absolute inset-0" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header bar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl md:hidden dark:bg-black/20">
          <MobileNav />
          <span className="gradient-text text-lg font-bold">Taskmaster</span>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mx-auto h-full max-w-7xl p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  )
}
