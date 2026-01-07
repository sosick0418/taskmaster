"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DailyStats, WeeklyStats, MonthlyStats } from "@/types/analytics"

type TimeRange = "daily" | "weekly" | "monthly"

interface CompletionChartProps {
  daily: DailyStats[]
  weekly: WeeklyStats[]
  monthly: MonthlyStats[]
}

export function CompletionChart({ daily, weekly, monthly }: CompletionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily")

  const getData = () => {
    switch (timeRange) {
      case "daily":
        return daily.slice(-14) // Last 14 days
      case "weekly":
        return weekly.slice(-8) // Last 8 weeks
      case "monthly":
        return monthly.slice(-6) // Last 6 months
    }
  }

  const getXKey = () => {
    switch (timeRange) {
      case "daily":
        return "date"
      case "weekly":
        return "week"
      case "monthly":
        return "month"
    }
  }

  const data = getData()

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Task Activity</h3>
            <p className="text-sm text-muted-foreground">Created vs Completed</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                timeRange === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={getXKey()}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="created"
              name="Created"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--muted-foreground))", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="url(#completedGradient)"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", r: 4 }}
              activeDot={{ r: 6, fill: "#8b5cf6" }}
            />
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
