import "@testing-library/jest-dom/vitest"
import { vi, beforeEach } from "vitest"

// Mock @/lib/auth (must be before any component imports)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve({
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      image: "https://example.com/avatar.jpg",
    },
  })),
}))

// Mock notifications actions
vi.mock("@/actions/notifications", () => ({
  getNotifications: vi.fn(() => Promise.resolve({ success: true, data: [] })),
  getUnreadCount: vi.fn(() => Promise.resolve({ success: true, data: 0 })),
  markAsRead: vi.fn(() => Promise.resolve({ success: true })),
  markAllAsRead: vi.fn(() => Promise.resolve({ success: true })),
  deleteNotification: vi.fn(() => Promise.resolve({ success: true })),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/tasks",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      },
    },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion")
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
        <span {...props}>{children}</span>
      ),
      aside: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <aside {...props}>{children}</aside>
      ),
      header: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <header {...props}>{children}</header>
      ),
      button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{children}</button>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})
