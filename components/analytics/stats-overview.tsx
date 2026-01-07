"use client"

import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Target,
  Zap,
  ListTodo,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductivityStats } from "@/types/analytics"

interface StatsOverviewProps {
  stats: ProductivityStats
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  gradient: string
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

function StatCard({ title, value, subtitle, icon, gradient, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-border/80 hover:bg-card/80"
    >
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-50", gradient)} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const totalThisWeek = stats.thisWeekCompleted + (stats.subtasks?.thisWeekCompleted ?? 0)
  const subtaskProgress = stats.subtasks?.total
    ? Math.round((stats.subtasks.completed / stats.subtasks.total) * 100)
    : 0

  const cards: Omit<StatCardProps, "delay">[] = [
    {
      title: "This Week",
      value: totalThisWeek,
      subtitle: `(${stats.thisWeekCompleted} tasks + ${stats.subtasks?.thisWeekCompleted ?? 0} subtasks)`,
      icon: <Target className="h-5 w-5 text-white" />,
      gradient: "from-violet-500 to-purple-600",
      trend: {
        value: stats.weekOverWeekChange,
        isPositive: stats.weekOverWeekChange >= 0,
      },
    },
    {
      title: "Subtasks",
      value: `${stats.subtasks?.completed ?? 0}/${stats.subtasks?.total ?? 0}`,
      subtitle: subtaskProgress > 0 ? `${subtaskProgress}% done` : "no subtasks",
      icon: <ListTodo className="h-5 w-5 text-white" />,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Current Streak",
      value: stats.currentStreak,
      subtitle: "days",
      icon: <Zap className="h-5 w-5 text-white" />,
      gradient: "from-orange-500 to-amber-600",
    },
    {
      title: "Avg. Completion Time",
      value: stats.averageCompletionTime ?? "-",
      subtitle: stats.averageCompletionTime ? "hours" : "",
      icon: <Clock className="h-5 w-5 text-white" />,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Most Productive",
      value: stats.mostProductiveDay ?? "-",
      icon: <Calendar className="h-5 w-5 text-white" />,
      gradient: "from-fuchsia-500 to-pink-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <StatCard key={card.title} {...card} delay={index * 0.1} />
      ))}
    </div>
  )
}
