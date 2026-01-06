import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { LoginForm } from "@/components/auth/login-form"

// Mock next-auth
const mockSignIn = vi.fn()
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset NODE_ENV for each test
    vi.stubEnv("NODE_ENV", "development")
  })

  it("renders Welcome Back title", () => {
    render(<LoginForm />)
    expect(screen.getByText("Welcome Back")).toBeInTheDocument()
  })

  it("renders sign in description", () => {
    render(<LoginForm />)
    expect(screen.getByText("Sign in to manage your tasks")).toBeInTheDocument()
  })

  it("renders GitHub sign in button", () => {
    render(<LoginForm />)
    expect(screen.getByText("Continue with GitHub")).toBeInTheDocument()
  })

  it("renders Google sign in button", () => {
    render(<LoginForm />)
    expect(screen.getByText("Continue with Google")).toBeInTheDocument()
  })

  it("calls signIn with github when GitHub button is clicked", () => {
    render(<LoginForm />)
    const githubButton = screen.getByText("Continue with GitHub")
    fireEvent.click(githubButton)
    expect(mockSignIn).toHaveBeenCalledWith("github", { callbackUrl: "/tasks" })
  })

  it("calls signIn with google when Google button is clicked", () => {
    render(<LoginForm />)
    const googleButton = screen.getByText("Continue with Google")
    fireEvent.click(googleButton)
    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/tasks" })
  })

  it("renders test login section in development mode", () => {
    render(<LoginForm />)
    expect(screen.getByText("Dev Only")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("test@example.com")).toBeInTheDocument()
  })

  it("renders test login button in development mode", () => {
    render(<LoginForm />)
    expect(screen.getByText("Test Login (Dev)")).toBeInTheDocument()
  })

  it("allows changing test email input", () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText("test@example.com")
    fireEvent.change(emailInput, { target: { value: "newtest@example.com" } })
    expect(emailInput).toHaveValue("newtest@example.com")
  })

  it("calls signIn with credentials when test login button is clicked", async () => {
    render(<LoginForm />)
    const testLoginButton = screen.getByText("Test Login (Dev)")
    fireEvent.click(testLoginButton)
    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      callbackUrl: "/tasks",
    })
  })

  it("has default email value in test input", () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText("test@example.com")
    expect(emailInput).toHaveValue("test@example.com")
  })
})
