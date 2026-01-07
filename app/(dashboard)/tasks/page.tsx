import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTasks, getTaskStats } from "@/actions/tasks"
import { TaskListView } from "@/components/tasks/task-list-view"

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const [tasksResult, statsResult] = await Promise.all([
    getTasks(),
    getTaskStats(),
  ])

  const tasks = tasksResult.success ? tasksResult.data : []
  const stats = statsResult.success
    ? statsResult.data
    : {
        total: 0,
        inProgress: 0,
        completed: 0,
        todo: 0,
        tasks: { total: 0, completed: 0, inProgress: 0 },
        subtasks: { total: 0, completed: 0 },
      }

  return (
    <TaskListView
      initialTasks={tasks}
      stats={stats}
      userName={session.user.name?.split(" ")[0]}
    />
  )
}
