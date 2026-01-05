import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-white/50">
          Manage your account and preferences.
        </p>
      </div>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Profile section */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-white/50">
            Your profile information from your OAuth provider.
          </p>

          <div className="mt-6 flex items-center gap-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                className="h-16 w-16 rounded-full ring-2 ring-white/10"
              />
            )}
            <div>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-white/50">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Appearance section */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-white/50">
            Customize how Taskmaster looks on your device.
          </p>

          <div className="mt-6">
            <p className="text-sm text-white/70">
              Use the theme toggle in the header to switch between light and dark mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
