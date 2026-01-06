"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckSquare,
  Settings,
  ChevronLeft,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    gradient: "from-violet-500 to-cyan-600",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-fuchsia-500 to-pink-600",
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex h-screen flex-col border-r border-border bg-background/80 backdrop-blur-2xl dark:bg-black/40"
      >
        {/* Gradient accent line */}
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-violet-500/50 via-transparent to-cyan-500/50" />

        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/tasks" className="flex cursor-pointer items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-lg shadow-violet-500/25"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg font-bold tracking-tight"
                >
                  <span className="gradient-text">Task</span>
                  <span className="text-foreground">master</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-3")}>
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            const isHovered = hoveredItem === item.title

            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="block cursor-pointer"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl transition-all duration-300",
                        isCollapsed ? "justify-center p-2" : "px-3 py-2.5",
                        isActive
                          ? "bg-violet-500/15 text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className={cn(
                            "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b",
                            item.gradient
                          )}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* Hover glow */}
                      <AnimatePresence>
                        {isHovered && !isActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                              "absolute inset-0 rounded-xl bg-gradient-to-r opacity-[0.08]",
                              item.gradient
                            )}
                          />
                        )}
                      </AnimatePresence>

                      <div
                        className={cn(
                          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                            : "bg-muted/60 dark:bg-muted group-hover:bg-accent"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4.5 w-4.5 transition-colors",
                            isActive ? "text-white" : "text-muted-foreground group-hover:text-accent-foreground"
                          )}
                        />
                      </div>

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" sideOffset={10}>
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full cursor-pointer justify-center gap-2 text-muted-foreground hover:bg-muted hover:text-foreground",
              !isCollapsed && "justify-start px-3"
            )}
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
