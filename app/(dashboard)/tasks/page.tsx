import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back,{" "}
          <span className="gradient-text">
            {session.user.name?.split(" ")[0] ?? "there"}
          </span>
        </h1>
        <p className="text-white/50">
          Here&apos;s what&apos;s on your plate today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Tasks", value: "0", gradient: "from-violet-500 to-purple-600" },
          { label: "In Progress", value: "0", gradient: "from-cyan-500 to-blue-600" },
          { label: "Completed", value: "0", gradient: "from-fuchsia-500 to-pink-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            {/* Gradient accent */}
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${stat.gradient} opacity-50`}
            />

            <p className="text-sm font-medium text-white/50">{stat.label}</p>
            <p className={`mt-2 text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state placeholder */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.01] py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
          <svg
            className="h-8 w-8 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-white/80">No tasks yet</h3>
        <p className="mt-1 text-sm text-white/40">
          Create your first task to get started
        </p>
        <button className="mt-6 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40">
          Create Task
        </button>
      </div>
    </div>
  )
}
