import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  FadeIn,
  ScaleIn,
  SlideIn,
} from "@/components/shared/page-transition"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/test",
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div data-testid="motion-div" {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

describe("PageTransition", () => {
  it("renders children", () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    )
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it("wraps children in motion div", () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
  })
})

describe("StaggerContainer", () => {
  it("renders children", () => {
    render(
      <StaggerContainer>
        <div>Child 1</div>
        <div>Child 2</div>
      </StaggerContainer>
    )
    expect(screen.getByText("Child 1")).toBeInTheDocument()
    expect(screen.getByText("Child 2")).toBeInTheDocument()
  })

  it("wraps children in motion div", () => {
    render(
      <StaggerContainer>
        <div>Test Content</div>
      </StaggerContainer>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
  })
})

describe("StaggerItem", () => {
  it("renders children", () => {
    render(
      <StaggerItem>
        <span>Item Content</span>
      </StaggerItem>
    )
    expect(screen.getByText("Item Content")).toBeInTheDocument()
  })

  it("wraps children in motion div", () => {
    render(
      <StaggerItem>
        <span>Item Content</span>
      </StaggerItem>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
  })
})

describe("FadeIn", () => {
  it("renders children", () => {
    render(
      <FadeIn>
        <div>Fade Content</div>
      </FadeIn>
    )
    expect(screen.getByText("Fade Content")).toBeInTheDocument()
  })

  it("wraps children in motion div", () => {
    render(
      <FadeIn>
        <div>Fade Content</div>
      </FadeIn>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
  })

  it("accepts delay prop", () => {
    render(
      <FadeIn delay={0.5}>
        <div>Delayed Content</div>
      </FadeIn>
    )
    expect(screen.getByText("Delayed Content")).toBeInTheDocument()
  })

  it("accepts duration prop", () => {
    render(
      <FadeIn duration={1}>
        <div>Custom Duration</div>
      </FadeIn>
    )
    expect(screen.getByText("Custom Duration")).toBeInTheDocument()
  })
})

describe("ScaleIn", () => {
  it("renders children", () => {
    render(
      <ScaleIn>
        <div>Scale Content</div>
      </ScaleIn>
    )
    expect(screen.getByText("Scale Content")).toBeInTheDocument()
  })

  it("wraps children in motion div", () => {
    render(
      <ScaleIn>
        <div>Scale Content</div>
      </ScaleIn>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
  })

  it("accepts delay prop", () => {
    render(
      <ScaleIn delay={0.3}>
        <div>Delayed Scale</div>
      </ScaleIn>
    )
    expect(screen.getByText("Delayed Scale")).toBeInTheDocument()
  })
})

describe("SlideIn", () => {
  it("renders children", () => {
    render(
      <SlideIn>
        <div>Slide Content</div>
      </SlideIn>
    )
    expect(screen.getByText("Slide Content")).toBeInTheDocument()
  })

  it("wraps children in motion div", () => {
    render(
      <SlideIn>
        <div>Slide Content</div>
      </SlideIn>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
  })

  it("accepts left direction", () => {
    render(
      <SlideIn direction="left">
        <div>Left Slide</div>
      </SlideIn>
    )
    expect(screen.getByText("Left Slide")).toBeInTheDocument()
  })

  it("accepts right direction", () => {
    render(
      <SlideIn direction="right">
        <div>Right Slide</div>
      </SlideIn>
    )
    expect(screen.getByText("Right Slide")).toBeInTheDocument()
  })

  it("accepts up direction", () => {
    render(
      <SlideIn direction="up">
        <div>Up Slide</div>
      </SlideIn>
    )
    expect(screen.getByText("Up Slide")).toBeInTheDocument()
  })

  it("accepts down direction", () => {
    render(
      <SlideIn direction="down">
        <div>Down Slide</div>
      </SlideIn>
    )
    expect(screen.getByText("Down Slide")).toBeInTheDocument()
  })

  it("accepts delay prop", () => {
    render(
      <SlideIn delay={0.2}>
        <div>Delayed Slide</div>
      </SlideIn>
    )
    expect(screen.getByText("Delayed Slide")).toBeInTheDocument()
  })
})
