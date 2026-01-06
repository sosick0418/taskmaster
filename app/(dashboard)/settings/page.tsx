import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { getNotificationPreferences } from "@/actions/notifications"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const prefsResult = await getNotificationPreferences()
  const preferences = prefsResult.success ? prefsResult.data : null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Profile section */}
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile information from your OAuth provider.
          </p>

          <div className="mt-6 flex items-center gap-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                className="h-16 w-16 rounded-full ring-2 ring-border"
              />
            )}
            <div>
              <p className="font-medium text-foreground">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Notifications section */}
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure how and when you receive notifications.
          </p>

          <div className="mt-6">
            {preferences ? (
              <NotificationSettings initialPreferences={preferences} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Failed to load notification preferences.
              </p>
            )}
          </div>
        </div>

        {/* Appearance section */}
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize how Taskmaster looks on your device.
          </p>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              Use the theme toggle in the header to switch between light and dark mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
