"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion";
import {
  CheckSquare,
  Settings,
  Menu,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-border bg-background/95 backdrop-blur-2xl p-0 dark:bg-black/95"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">Task</span>
              <span className="text-foreground">master</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1 p-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className={cn(
                        "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b",
                        item.gradient
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? `bg-gradient-to-br ${item.gradient}`
                        : "bg-muted/60 dark:bg-muted group-hover:bg-accent"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-accent-foreground"
                      )}
                    />
                  </div>

                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
