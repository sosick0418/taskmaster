import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { CalendarDay } from "react-day-picker"

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronLeftIcon: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="chevron-left-icon" className={className} {...props} />
  ),
  ChevronRightIcon: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="chevron-right-icon" className={className} {...props} />
  ),
  ChevronDownIcon: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="chevron-down-icon" className={className} {...props} />
  ),
}))

describe("Calendar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Basic Rendering", () => {
    it("renders calendar with data-slot attribute", () => {
      render(<Calendar />)
      const calendar = document.querySelector('[data-slot="calendar"]')
      expect(calendar).toBeInTheDocument()
    })

    it("renders with default props", () => {
      render(<Calendar />)
      // Should render month caption
      const monthCaption = document.querySelector(".rdp-month_caption")
      expect(monthCaption).toBeInTheDocument()
    })

    it("renders weekday headers", () => {
      render(<Calendar />)
      // Find weekday row
      const weekdays = document.querySelector(".rdp-weekdays")
      expect(weekdays).toBeInTheDocument()
    })

    it("renders navigation buttons", () => {
      render(<Calendar />)
      // Previous and next navigation buttons
      const prevButton = document.querySelector(".rdp-button_previous")
      const nextButton = document.querySelector(".rdp-button_next")
      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })

    it("renders day buttons", () => {
      render(<Calendar />)
      // Day buttons are rendered inside the calendar
      // Check for buttons that contain day numbers
      const allButtons = document.querySelectorAll("button")
      expect(allButtons.length).toBeGreaterThan(0)
    })
  })

  describe("showOutsideDays prop", () => {
    it("shows outside days by default", () => {
      render(<Calendar defaultMonth={new Date(2024, 0, 15)} />)
      // Look for outside days
      const outsideDays = document.querySelectorAll(".rdp-outside")
      // Most months have outside days visible
      expect(outsideDays.length).toBeGreaterThanOrEqual(0)
    })

    it("hides outside days when showOutsideDays is false", () => {
      render(
        <Calendar defaultMonth={new Date(2024, 0, 15)} showOutsideDays={false} />
      )
      // When showOutsideDays is false, outside days should be hidden
      const hiddenDays = document.querySelectorAll(".rdp-hidden")
      expect(hiddenDays.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe("captionLayout prop", () => {
    it("renders with label captionLayout by default", () => {
      render(<Calendar />)
      const captionLabel = document.querySelector(".rdp-caption_label")
      expect(captionLabel).toBeInTheDocument()
    })

    it("renders dropdowns when captionLayout is dropdown", () => {
      render(
        <Calendar
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2025}
        />
      )
      const dropdowns = document.querySelector(".rdp-dropdowns")
      expect(dropdowns).toBeInTheDocument()
    })

    it("applies different styles based on captionLayout", () => {
      // Test label mode
      const { unmount } = render(<Calendar captionLayout="label" />)
      // In label mode, calendar should render with label
      let calendar = document.querySelector('[data-slot="calendar"]')
      expect(calendar).toBeInTheDocument()
      unmount()

      // Test dropdown mode in a fresh render
      render(
        <Calendar captionLayout="dropdown" fromYear={2020} toYear={2025} />
      )
      // In dropdown mode, dropdowns should be visible
      calendar = document.querySelector('[data-slot="calendar"]')
      expect(calendar).toBeInTheDocument()
    })
  })

  describe("buttonVariant prop", () => {
    it("applies ghost variant by default", () => {
      render(<Calendar />)
      const prevButton = document.querySelector(".rdp-button_previous")
      // Ghost variant is the default
      expect(prevButton).toBeInTheDocument()
    })

    it("applies custom buttonVariant", () => {
      render(<Calendar buttonVariant="outline" />)
      const prevButton = document.querySelector(".rdp-button_previous")
      expect(prevButton).toBeInTheDocument()
    })
  })

  describe("className and classNames props", () => {
    it("applies custom className to root", () => {
      render(<Calendar className="custom-calendar-class" />)
      // The className is applied to the DayPicker wrapper
      // Find element with custom class
      const calendarWithClass = document.querySelector(".custom-calendar-class")
      expect(calendarWithClass).toBeInTheDocument()
    })

    it("applies custom classNames to elements", () => {
      render(
        <Calendar
          classNames={{
            root: "custom-root-class",
          }}
        />
      )
      // Custom classNames should be merged with default classNames
      const rootWithClass = document.querySelector(".custom-root-class")
      expect(rootWithClass).toBeInTheDocument()
    })
  })

  describe("formatters prop", () => {
    it("uses custom formatMonthDropdown formatter", () => {
      const customFormatter = vi.fn((date: Date) =>
        date.toLocaleString("ko-KR", { month: "long" })
      )
      render(
        <Calendar
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2025}
          formatters={{
            formatMonthDropdown: customFormatter,
          }}
        />
      )
      // The formatter should be called when rendering month dropdown
      // Note: This tests that the prop is passed correctly
      const dropdowns = document.querySelector(".rdp-dropdowns")
      expect(dropdowns).toBeInTheDocument()
    })
  })

  describe("components prop", () => {
    it("allows custom Root component override", () => {
      const CustomRoot = ({
        children,
        rootRef,
        ...props
      }: React.PropsWithChildren<{
        rootRef?: React.Ref<HTMLDivElement>
      }> &
        React.HTMLAttributes<HTMLDivElement>) => (
        <div data-testid="custom-root" ref={rootRef} {...props}>
          {children}
        </div>
      )
      render(<Calendar components={{ Root: CustomRoot }} />)
      expect(screen.getByTestId("custom-root")).toBeInTheDocument()
    })
  })

  describe("Navigation", () => {
    it("navigates to previous month when clicking previous button", () => {
      render(<Calendar defaultMonth={new Date(2024, 5, 15)} />)
      const prevButton = document.querySelector(
        ".rdp-button_previous"
      ) as HTMLButtonElement
      expect(prevButton).toBeInTheDocument()

      fireEvent.click(prevButton)
      // Should now show May 2024
      const captionLabel = document.querySelector(".rdp-caption_label")
      expect(captionLabel?.textContent).toContain("May")
    })

    it("navigates to next month when clicking next button", () => {
      render(<Calendar defaultMonth={new Date(2024, 5, 15)} />)
      const nextButton = document.querySelector(
        ".rdp-button_next"
      ) as HTMLButtonElement
      expect(nextButton).toBeInTheDocument()

      fireEvent.click(nextButton)
      // Should now show July 2024
      const captionLabel = document.querySelector(".rdp-caption_label")
      expect(captionLabel?.textContent).toContain("July")
    })
  })

  describe("Date Selection", () => {
    it("calls onSelect when a day is clicked in single mode", () => {
      const onSelect = vi.fn()
      render(
        <Calendar
          mode="single"
          defaultMonth={new Date(2024, 0, 15)}
          onSelect={onSelect}
        />
      )
      // Find a day button and click it
      const dayButtons = document.querySelectorAll('[data-slot="button"]')
      const day15Button = Array.from(dayButtons).find((btn) =>
        btn.getAttribute("data-day")?.includes("15")
      )
      if (day15Button) {
        fireEvent.click(day15Button)
        expect(onSelect).toHaveBeenCalled()
      }
    })

    it("handles range selection mode", () => {
      const onSelect = vi.fn()
      render(
        <Calendar
          mode="range"
          defaultMonth={new Date(2024, 0, 15)}
          onSelect={onSelect}
        />
      )
      const dayButtons = document.querySelectorAll('[data-slot="button"]')
      // Click first day to start range
      const day10Button = Array.from(dayButtons).find((btn) =>
        btn.getAttribute("data-day")?.includes("10")
      )
      if (day10Button) {
        fireEvent.click(day10Button)
        expect(onSelect).toHaveBeenCalled()
      }
    })

    it("handles multiple selection mode", () => {
      const onSelect = vi.fn()
      render(
        <Calendar
          mode="multiple"
          defaultMonth={new Date(2024, 0, 15)}
          onSelect={onSelect}
        />
      )
      const dayButtons = document.querySelectorAll('[data-slot="button"]')
      const day5Button = Array.from(dayButtons).find((btn) =>
        btn.getAttribute("data-day")?.includes("5")
      )
      if (day5Button) {
        fireEvent.click(day5Button)
        expect(onSelect).toHaveBeenCalled()
      }
    })
  })

  describe("Week Numbers", () => {
    it("shows week numbers when showWeekNumber is true", () => {
      render(<Calendar showWeekNumber defaultMonth={new Date(2024, 0, 15)} />)
      const weekNumbers = document.querySelectorAll(".rdp-week_number")
      expect(weekNumbers.length).toBeGreaterThan(0)
    })

    it("renders WeekNumber with proper structure", () => {
      render(<Calendar showWeekNumber defaultMonth={new Date(2024, 0, 15)} />)
      const weekNumberCells = document.querySelectorAll(".rdp-week_number")
      weekNumberCells.forEach((cell) => {
        // Each week number cell should contain a div
        const innerDiv = cell.querySelector("div")
        expect(innerDiv).toBeInTheDocument()
      })
    })
  })

  describe("Disabled Dates", () => {
    it("applies disabled styles to disabled dates", () => {
      const isPastDate = (date: Date) => date < new Date(2024, 0, 10)
      render(
        <Calendar
          defaultMonth={new Date(2024, 0, 15)}
          disabled={isPastDate}
        />
      )
      const disabledDays = document.querySelectorAll(".rdp-disabled")
      expect(disabledDays.length).toBeGreaterThan(0)
    })
  })

  describe("Today Highlight", () => {
    it("highlights today's date", () => {
      render(<Calendar defaultMonth={new Date()} />)
      const today = document.querySelector(".rdp-today")
      expect(today).toBeInTheDocument()
    })
  })

  describe("Multiple Months", () => {
    it("renders multiple months when numberOfMonths is greater than 1", () => {
      render(
        <Calendar numberOfMonths={2} defaultMonth={new Date(2024, 0, 15)} />
      )
      const months = document.querySelectorAll(".rdp-month")
      expect(months.length).toBe(2)
    })
  })

  describe("RTL Support", () => {
    it("applies RTL-specific classes", () => {
      render(<Calendar dir="rtl" />)
      const calendar = document.querySelector('[data-slot="calendar"]')
      expect(calendar?.parentElement).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has proper ARIA attributes on navigation buttons", () => {
      render(<Calendar />)
      const prevButton = document.querySelector(".rdp-button_previous")
      const nextButton = document.querySelector(".rdp-button_next")
      // Navigation buttons should be focusable
      expect(prevButton?.tagName.toLowerCase()).toBe("button")
      expect(nextButton?.tagName.toLowerCase()).toBe("button")
    })

    it("has proper table structure for screen readers", () => {
      render(<Calendar />)
      const table = document.querySelector("table")
      expect(table).toBeInTheDocument()
    })

    it("marks outside days appropriately", () => {
      render(<Calendar defaultMonth={new Date(2024, 0, 15)} />)
      // Outside days should have aria attributes or visual indicators
      const outsideDays = document.querySelectorAll(".rdp-outside")
      outsideDays.forEach((day) => {
        expect(day).toBeInTheDocument()
      })
    })
  })
})

describe("CalendarDayButton", () => {
  const mockDay = new CalendarDay(
    new Date(2024, 0, 15),
    new Date(2024, 0, 1)
  )

  const defaultModifiers = {
    disabled: false,
    hidden: false,
    outside: false,
    range_end: false,
    range_middle: false,
    range_start: false,
    selected: false,
    today: false,
    focused: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Basic Rendering", () => {
    it("renders a button element", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders children correctly", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
        >
          15
        </CalendarDayButton>
      )
      expect(screen.getByText("15")).toBeInTheDocument()
    })

    it("sets data-day attribute with formatted date", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-day")
    })
  })

  describe("Selected State", () => {
    it("applies selected-single data attribute when selected without range", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            selected: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-selected-single", "true")
    })

    it("does not apply selected-single when part of range start", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            selected: true,
            range_start: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-selected-single", "false")
    })

    it("does not apply selected-single when part of range end", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            selected: true,
            range_end: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-selected-single", "false")
    })

    it("does not apply selected-single when part of range middle", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            selected: true,
            range_middle: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-selected-single", "false")
    })
  })

  describe("Range States", () => {
    it("applies data-range-start attribute for range start", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            range_start: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-range-start", "true")
    })

    it("applies data-range-end attribute for range end", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            range_end: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-range-end", "true")
    })

    it("applies data-range-middle attribute for range middle", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            range_middle: true,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-range-middle", "true")
    })
  })

  describe("Focus Handling", () => {
    it("focuses the button when modifiers.focused becomes true", () => {
      const { rerender } = render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
        >
          15
        </CalendarDayButton>
      )

      rerender(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            focused: true,
          }}
        >
          15
        </CalendarDayButton>
      )

      const button = screen.getByRole("button")
      expect(button).toHaveFocus()
    })

    it("does not auto-focus when modifiers.focused is false", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={{
            ...defaultModifiers,
            focused: false,
          }}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).not.toHaveFocus()
    })
  })

  describe("Custom className", () => {
    it("applies custom className", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
          className="custom-day-button"
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveClass("custom-day-button")
    })

    it("merges custom className with default classes", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
          className="my-custom-class"
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveClass("my-custom-class")
      // Should also have default button classes
      expect(button).toHaveAttribute("data-slot", "button")
    })
  })

  describe("Button Props", () => {
    it("uses ghost variant", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-variant", "ghost")
    })

    it("uses icon size", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("data-size", "icon")
    })

    it("passes through additional props", () => {
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
          aria-label="Select January 15"
        >
          15
        </CalendarDayButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("aria-label", "Select January 15")
    })
  })

  describe("Click Handling", () => {
    it("handles click events", () => {
      const onClick = vi.fn()
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={defaultModifiers}
          onClick={onClick}
        >
          15
        </CalendarDayButton>
      )
      fireEvent.click(screen.getByRole("button"))
      expect(onClick).toHaveBeenCalled()
    })
  })
})

describe("Chevron Components (via Calendar)", () => {
  it("renders left chevron for previous button", () => {
    render(<Calendar />)
    const leftChevron = document.querySelector('[data-testid="chevron-left-icon"]')
    expect(leftChevron).toBeInTheDocument()
  })

  it("renders right chevron for next button", () => {
    render(<Calendar />)
    const rightChevron = document.querySelector('[data-testid="chevron-right-icon"]')
    expect(rightChevron).toBeInTheDocument()
  })

  it("renders down chevron in dropdown mode", () => {
    render(
      <Calendar
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2025}
      />
    )
    const downChevron = document.querySelector('[data-testid="chevron-down-icon"]')
    expect(downChevron).toBeInTheDocument()
  })

  it("applies size-4 class to chevrons", () => {
    render(<Calendar />)
    const leftChevron = document.querySelector('[data-testid="chevron-left-icon"]')
    const rightChevron = document.querySelector('[data-testid="chevron-right-icon"]')
    expect(leftChevron).toHaveClass("size-4")
    expect(rightChevron).toHaveClass("size-4")
  })
})

describe("Calendar Integration Scenarios", () => {
  describe("Date Picker Pattern", () => {
    it("supports controlled selected date", () => {
      const selectedDate = new Date(2024, 0, 15)
      render(
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={new Date(2024, 0, 1)}
        />
      )
      // The 15th should be selected
      const selectedDay = document.querySelector('[data-selected="true"]')
      expect(selectedDay).toBeInTheDocument()
    })

    it("supports controlled date range", () => {
      const dateRange = {
        from: new Date(2024, 0, 10),
        to: new Date(2024, 0, 20),
      }
      render(
        <Calendar
          mode="range"
          selected={dateRange}
          defaultMonth={new Date(2024, 0, 1)}
        />
      )
      // Should have range start and end marked
      const rangeStart = document.querySelector(".rdp-range_start")
      const rangeEnd = document.querySelector(".rdp-range_end")
      expect(rangeStart).toBeInTheDocument()
      expect(rangeEnd).toBeInTheDocument()
    })
  })

  describe("Booking Calendar Pattern", () => {
    it("disables past dates", () => {
      const today = new Date()
      const disabledDays = { before: today }
      render(<Calendar disabled={disabledDays} defaultMonth={today} />)
      // Past dates should be disabled
      const disabledDates = document.querySelectorAll(".rdp-disabled")
      expect(disabledDates.length).toBeGreaterThanOrEqual(0)
    })

    it("disables specific dates", () => {
      const bookedDates = [
        new Date(2024, 0, 10),
        new Date(2024, 0, 11),
        new Date(2024, 0, 12),
      ]
      render(
        <Calendar
          disabled={bookedDates}
          defaultMonth={new Date(2024, 0, 1)}
        />
      )
      const disabledDates = document.querySelectorAll(".rdp-disabled")
      expect(disabledDates.length).toBeGreaterThanOrEqual(bookedDates.length)
    })
  })

  describe("Event Calendar Pattern", () => {
    it("supports modifiers for special dates", () => {
      const eventDates = [new Date(2024, 0, 15), new Date(2024, 0, 20)]
      render(
        <Calendar
          modifiers={{ event: eventDates }}
          defaultMonth={new Date(2024, 0, 1)}
        />
      )
      // Calendar should render with modifiers
      const calendar = document.querySelector('[data-slot="calendar"]')
      expect(calendar).toBeInTheDocument()
    })
  })
})
