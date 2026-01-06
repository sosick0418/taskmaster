import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAnalyticsData } from "@/actions/analytics"
import { StatsOverview } from "@/components/analytics/stats-overview"
import { CompletionChart } from "@/components/analytics/completion-chart"
import { PriorityChart } from "@/components/analytics/priority-chart"
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const result = await getAnalyticsData()

  if (!result.success) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    )
  }

  const { data } = result

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-muted-foreground">
          Track your productivity and task completion trends.
        </p>
      </div>

      {/* Stats cards */}
      <StatsOverview stats={data.productivity} />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CompletionChart
          daily={data.daily}
          weekly={data.weekly}
          monthly={data.monthly}
        />
        <PriorityChart
          priorityData={data.priorityDistribution}
          statusData={data.statusDistribution}
        />
      </div>

      {/* Activity heatmap */}
      <ActivityHeatmap
        data={data.activityHeatmap}
        currentStreak={data.productivity.currentStreak}
        longestStreak={data.productivity.longestStreak}
      />
    </div>
  )
}
