"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { format, parseISO, getDay, startOfWeek, addDays } from "date-fns"
import { Calendar, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ActivityDay } from "@/types/analytics"

interface ActivityHeatmapProps {
  data: ActivityDay[]
  currentStreak: number
  longestStreak: number
}

const LEVEL_COLORS = {
  0: "bg-muted",
  1: "bg-emerald-200 dark:bg-emerald-900",
  2: "bg-emerald-300 dark:bg-emerald-700",
  3: "bg-emerald-400 dark:bg-emerald-500",
  4: "bg-emerald-500 dark:bg-emerald-400",
} as const

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ActivityHeatmap({ data, currentStreak, longestStreak }: ActivityHeatmapProps) {
  // Group data by week
  const weeks = useMemo(() => {
    const weeksMap = new Map<string, ActivityDay[]>()

    data.forEach((day) => {
      const date = parseISO(day.date)
      const weekStart = format(startOfWeek(date), "yyyy-MM-dd")

      if (!weeksMap.has(weekStart)) {
        weeksMap.set(weekStart, new Array(7).fill(null).map((_, i) => ({
          date: format(addDays(startOfWeek(date), i), "yyyy-MM-dd"),
          count: 0,
          level: 0 as const,
        })))
      }

      const week = weeksMap.get(weekStart)!
      const dayIndex = getDay(date)
      week[dayIndex] = day
    })

    return Array.from(weeksMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, days]) => days)
  }, [data])

  // Get month labels for the header
  const monthLabels = useMemo(() => {
    const labels: { month: string; colStart: number }[] = []
    let currentMonth = -1

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find((d) => d.count >= 0)
      if (firstDayOfWeek) {
        const month = parseISO(firstDayOfWeek.date).getMonth()
        if (month !== currentMonth) {
          currentMonth = month
          labels.push({ month: MONTHS[month] ?? "", colStart: weekIndex })
        }
      }
    })

    return labels
  }, [weeks])

  const totalContributions = data.reduce((sum, day) => sum + day.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Activity</h3>
            <p className="text-sm text-muted-foreground">
              {totalContributions} tasks completed this year
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <div className="text-sm">
              <span className="font-medium text-foreground">{currentStreak}</span>
              <span className="text-muted-foreground"> day streak</span>
            </div>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Best: </span>
            <span className="font-medium text-foreground">{longestStreak} days</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month labels */}
          <div className="mb-2 flex pl-8">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{
                  marginLeft: i === 0 ? label.colStart * 14 : (label.colStart - (monthLabels[i - 1]?.colStart ?? 0)) * 14 - 24,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    "h-[12px] text-xs text-muted-foreground",
                    i % 2 === 1 && "opacity-0"
                  )}
                >
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              <TooltipProvider delayDuration={0}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: weekIndex * 0.01 + dayIndex * 0.005,
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                            className={cn(
                              "h-[12px] w-[12px] rounded-sm transition-colors hover:ring-2 hover:ring-foreground/20",
                              LEVEL_COLORS[day.level]
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">
                            {day.count} task{day.count !== 1 ? "s" : ""} completed
                          </p>
                          <p className="text-muted-foreground">
                            {format(parseISO(day.date), "MMM d, yyyy")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">Less</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <div
                key={level}
                className={cn("h-[12px] w-[12px] rounded-sm", LEVEL_COLORS[level])}
              />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
