import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { UserButton } from "@/components/auth/user-button"

// Mock next-auth
const mockSignOut = vi.fn()
const mockUseSession = vi.fn()

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
  useSession: () => mockUseSession(),
}))

// Mock UI components
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="avatar" className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    src ? <img data-testid="avatar-image" src={src} alt={alt} /> : null
  ),
  AvatarFallback: ({ children }: React.PropsWithChildren) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button data-testid="dropdown-item" onClick={onClick}>{children}</button>
  ),
  DropdownMenuLabel: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}))

describe("UserButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when no session", () => {
    mockUseSession.mockReturnValue({ data: null })
    const { container } = render(<UserButton />)
    expect(container.firstChild).toBeNull()
  })

  it("returns null when session has no user", () => {
    mockUseSession.mockReturnValue({ data: {} })
    const { container } = render(<UserButton />)
    expect(container.firstChild).toBeNull()
  })

  it("renders avatar when session exists", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: "https://example.com/avatar.jpg",
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByTestId("avatar")).toBeInTheDocument()
  })

  it("renders user initials in avatar fallback", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("JD")
  })

  it("renders single initial for single name", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("J")
  })

  it("limits initials to 2 characters", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Michael Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("JM")
  })

  it("renders user name in dropdown", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("renders user email in dropdown", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
  })

  it("renders Settings menu item", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders Sign out menu item", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    expect(screen.getByText("Sign out")).toBeInTheDocument()
  })

  it("calls signOut when Sign out is clicked", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
    })
    render(<UserButton />)
    const signOutButton = screen.getByText("Sign out").closest("button")
    fireEvent.click(signOutButton!)
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" })
  })
})
