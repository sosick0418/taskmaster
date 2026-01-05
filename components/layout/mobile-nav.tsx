"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  Menu,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  {
    title: "Dashboard",
    href: "/tasks",
    icon: LayoutDashboard,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    gradient: "from-cyan-500 to-blue-600",
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
          className="md:hidden text-white/60 hover:bg-white/[0.06] hover:text-white"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-white/[0.06] bg-black/95 backdrop-blur-2xl p-0"
      >
        <SheetHeader className="border-b border-white/[0.06] px-6 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">Task</span>
              <span className="text-white">master</span>
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
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
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
                        : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
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
