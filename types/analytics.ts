export interface DailyStats {
  date: string
  completed: number
  created: number
}

export interface WeeklyStats {
  week: string
  completed: number
  created: number
  completionRate: number
}

export interface MonthlyStats {
  month: string
  completed: number
  created: number
  completionRate: number
}

export interface PriorityDistribution {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  count: number
  percentage: number
}

export interface StatusDistribution {
  status: "TODO" | "IN_PROGRESS" | "DONE"
  count: number
  percentage: number
}

export interface ActivityDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4 // 0 = no activity, 4 = high activity
}

export interface ProductivityStats {
  currentStreak: number
  longestStreak: number
  thisWeekCompleted: number
  lastWeekCompleted: number
  weekOverWeekChange: number
  averageCompletionTime: number | null // in hours
  mostProductiveDay: string | null
  // Subtask stats
  subtasks: {
    total: number
    completed: number
    thisWeekCompleted: number
  }
}

export interface AnalyticsData {
  daily: DailyStats[]
  weekly: WeeklyStats[]
  monthly: MonthlyStats[]
  priorityDistribution: PriorityDistribution[]
  statusDistribution: StatusDistribution[]
  activityHeatmap: ActivityDay[]
  productivity: ProductivityStats
}
