import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { NotificationBell } from "@/components/notifications/notification-bell"

// Mock actions
vi.mock("@/actions/notifications", () => ({
  getNotifications: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: [
        {
          id: "1",
          type: "DUE_DATE_REMINDER",
          title: "Task due soon",
          message: "Your task is due tomorrow",
          isRead: false,
          createdAt: new Date(),
          task: { id: "task-1", title: "Test Task" },
        },
      ],
    })
  ),
  getUnreadCount: vi.fn(() => Promise.resolve({ success: true, data: 3 })),
}))

// Mock NotificationCenter
vi.mock("@/components/notifications/notification-center", () => ({
  NotificationCenter: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="notification-center">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders bell button", async () => {
    render(<NotificationBell />)
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument()
    })
  })

  it("displays unread count badge when there are unread notifications", async () => {
    render(<NotificationBell />)
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument()
    })
  })

  it("shows 9+ when unread count exceeds 9", async () => {
    const { getUnreadCount } = await import("@/actions/notifications")
    vi.mocked(getUnreadCount).mockResolvedValueOnce({ success: true, data: 15 })

    render(<NotificationBell />)
    await waitFor(() => {
      expect(screen.getByText("9+")).toBeInTheDocument()
    })
  })

  it("opens notification center on click", async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(screen.getByTestId("notification-center")).toBeInTheDocument()
    })
  })

  it("closes notification center when close button is clicked", async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    // Open
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(screen.getByTestId("notification-center")).toBeInTheDocument()
    })

    // Close using internal close button
    fireEvent.click(screen.getByText("Close"))
    await waitFor(() => {
      expect(screen.queryByTestId("notification-center")).not.toBeInTheDocument()
    })
  })

  it("closes on Escape key", async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    // Open
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(screen.getByTestId("notification-center")).toBeInTheDocument()
    })

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => {
      expect(screen.queryByTestId("notification-center")).not.toBeInTheDocument()
    })
  })

  it("does not show badge when unread count is 0", async () => {
    const { getUnreadCount } = await import("@/actions/notifications")
    vi.mocked(getUnreadCount).mockResolvedValueOnce({ success: true, data: 0 })

    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.queryByText("0")).not.toBeInTheDocument()
    })
  })
})
