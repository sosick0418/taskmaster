"use client"

import { useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { motion } from "framer-motion"
import { PieChart as PieChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PriorityDistribution, StatusDistribution } from "@/types/analytics"

type ChartMode = "priority" | "status"

interface PriorityChartProps {
  priorityData: PriorityDistribution[]
  statusData: StatusDistribution[]
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#94a3b8",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
}

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  DONE: "#10b981",
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
}

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}

export function PriorityChart({ priorityData, statusData }: PriorityChartProps) {
  const [mode, setMode] = useState<ChartMode>("priority")

  const data = mode === "priority" ? priorityData : statusData
  const colors = mode === "priority" ? PRIORITY_COLORS : STATUS_COLORS
  const labels = mode === "priority" ? PRIORITY_LABELS : STATUS_LABELS

  const chartData = data.map((item) => {
    const key = mode === "priority"
      ? (item as PriorityDistribution).priority
      : (item as StatusDistribution).status
    return {
      name: labels[key] ?? "",
      value: item.count,
      percentage: item.percentage,
      key,
    }
  })

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} tasks ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500">
            <PieChartIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Distribution</h3>
            <p className="text-sm text-muted-foreground">
              {mode === "priority" ? "By Priority" : "By Status"}
            </p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setMode("priority")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "priority"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Priority
          </button>
          <button
            onClick={() => setMode("status")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "status"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Status
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={colors[entry.key] ?? "#94a3b8"}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{total}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {chartData.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[item.key] }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <span className="text-sm font-medium text-foreground">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground">
                ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
