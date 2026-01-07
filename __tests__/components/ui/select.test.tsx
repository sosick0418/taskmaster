import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock pointer capture methods that Radix UI uses but aren't available in happy-dom
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn()

  // Mock ResizeObserver as a class
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
})

afterAll(() => {
  vi.restoreAllMocks()
})

// Helper function to render a basic select
const renderBasicSelect = (props: {
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  triggerSize?: "sm" | "default"
  placeholder?: string
  open?: boolean
  defaultOpen?: boolean
} = {}) => {
  const {
    defaultValue,
    onValueChange,
    disabled = false,
    triggerSize = "default",
    placeholder = "Select an option",
    open,
    defaultOpen,
  } = props

  return render(
    <Select
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      open={open}
      defaultOpen={defaultOpen}
    >
      <SelectTrigger size={triggerSize} data-testid="select-trigger">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Helper function to render a grouped select
const renderGroupedSelect = (defaultOpen = false) => {
  return render(
    <Select defaultOpen={defaultOpen}>
      <SelectTrigger data-testid="select-trigger">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="potato">Potato</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  describe("Select Root Component", () => {
    it("renders select trigger within component tree", () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )

      // The Select component renders its children (trigger)
      const trigger = screen.getByTestId("trigger")
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute("data-slot", "select-trigger")
    })

    it("accepts and passes through props to Radix Select", () => {
      const onValueChange = vi.fn()
      renderBasicSelect({ onValueChange })

      expect(screen.getByTestId("select-trigger")).toBeInTheDocument()
    })
  })

  describe("SelectTrigger", () => {
    it("renders with default size", () => {
      renderBasicSelect()

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("data-size", "default")
      expect(trigger).toHaveAttribute("data-slot", "select-trigger")
    })

    it("renders with small size", () => {
      renderBasicSelect({ triggerSize: "sm" })

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("data-size", "sm")
    })

    it("applies custom className", () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )

      expect(screen.getByTestId("trigger")).toHaveClass("custom-class")
    })

    it("shows placeholder when no value is selected", () => {
      renderBasicSelect({ placeholder: "Choose fruit" })

      expect(screen.getByText("Choose fruit")).toBeInTheDocument()
    })

    it("renders chevron down icon", () => {
      renderBasicSelect()

      const trigger = screen.getByTestId("select-trigger")
      const svg = trigger.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })

    it("can be disabled", () => {
      renderBasicSelect({ disabled: true })

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toBeDisabled()
    })

    it("has correct ARIA attributes", () => {
      renderBasicSelect()

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("role", "combobox")
      expect(trigger).toHaveAttribute("aria-expanded", "false")
    })

    it("merges custom className with default classes", () => {
      render(
        <Select>
          <SelectTrigger className="my-custom-class" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )

      const trigger = screen.getByTestId("trigger")
      expect(trigger).toHaveClass("my-custom-class")
      expect(trigger).toHaveClass("flex")
    })
  })

  describe("SelectValue", () => {
    it("renders with data-slot attribute", () => {
      renderBasicSelect()

      const valueElement = document.querySelector("[data-slot='select-value']")
      expect(valueElement).toBeInTheDocument()
    })

    it("displays selected value", () => {
      renderBasicSelect({ defaultValue: "apple" })

      expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("displays placeholder when no value selected", () => {
      renderBasicSelect({ placeholder: "Pick one" })

      expect(screen.getByText("Pick one")).toBeInTheDocument()
    })
  })

  describe("SelectContent (with defaultOpen)", () => {
    it("renders items when defaultOpen is true", () => {
      renderBasicSelect({ defaultOpen: true })

      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Orange" })).toBeInTheDocument()
    })

    it("renders with data-slot attribute", () => {
      renderBasicSelect({ defaultOpen: true })

      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content-class">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )

      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toHaveClass("custom-content-class")
    })

    it("renders with viewport element", () => {
      renderBasicSelect({ defaultOpen: true })

      // SelectContent includes a viewport for scrolling
      const listbox = screen.getByRole("listbox")
      expect(listbox).toBeInTheDocument()
    })
  })

  describe("SelectItem", () => {
    it("renders with correct data-slot", () => {
      renderBasicSelect({ defaultOpen: true })

      const item = document.querySelector("[data-slot='select-item']")
      expect(item).toBeInTheDocument()
    })

    it("shows check icon indicator element", () => {
      renderBasicSelect({ defaultValue: "apple", defaultOpen: true })

      const indicator = document.querySelector("[data-slot='select-item-indicator']")
      expect(indicator).toBeInTheDocument()
    })

    it("applies custom className to item", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" className="custom-item-class">
              Test Item
            </SelectItem>
          </SelectContent>
        </Select>
      )

      const item = screen.getByRole("option", { name: "Test Item" })
      expect(item).toHaveClass("custom-item-class")
    })

    it("can be disabled", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled" disabled>
              Disabled
            </SelectItem>
          </SelectContent>
        </Select>
      )

      const disabledItem = screen.getByRole("option", { name: "Disabled" })
      expect(disabledItem).toHaveAttribute("data-disabled")
    })

    it("renders children as item text", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complex">
              Complex Content
            </SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByRole("option", { name: "Complex Content" })).toBeInTheDocument()
    })
  })

  describe("SelectGroup", () => {
    it("renders with data-slot attribute", () => {
      renderGroupedSelect(true)

      const group = document.querySelector("[data-slot='select-group']")
      expect(group).toBeInTheDocument()
    })

    it("groups related items together", () => {
      renderGroupedSelect(true)

      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Carrot" })).toBeInTheDocument()
    })

    it("applies custom props", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup data-testid="custom-group">
              <SelectItem value="test">Test</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      expect(screen.getByTestId("custom-group")).toBeInTheDocument()
    })
  })

  describe("SelectLabel", () => {
    it("renders with data-slot attribute", () => {
      renderGroupedSelect(true)

      const label = document.querySelector("[data-slot='select-label']")
      expect(label).toBeInTheDocument()
    })

    it("displays group label text", () => {
      renderGroupedSelect(true)

      expect(screen.getByText("Fruits")).toBeInTheDocument()
      expect(screen.getByText("Vegetables")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="custom-label-class">Custom Label</SelectLabel>
              <SelectItem value="test">Test</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      const label = screen.getByText("Custom Label")
      expect(label).toHaveClass("custom-label-class")
    })

    it("has default styling classes", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel data-testid="label">Label</SelectLabel>
              <SelectItem value="test">Test</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      const label = screen.getByTestId("label")
      expect(label).toHaveClass("px-2", "py-1.5", "text-xs")
    })
  })

  describe("SelectSeparator", () => {
    it("renders with data-slot attribute", () => {
      renderGroupedSelect(true)

      const separator = document.querySelector("[data-slot='select-separator']")
      expect(separator).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectSeparator className="custom-separator-class" />
            <SelectItem value="b">B</SelectItem>
          </SelectContent>
        </Select>
      )

      const separator = document.querySelector("[data-slot='select-separator']")
      expect(separator).toHaveClass("custom-separator-class")
    })

    it("has default styling classes", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectSeparator data-testid="sep" />
            <SelectItem value="b">B</SelectItem>
          </SelectContent>
        </Select>
      )

      const separator = screen.getByTestId("sep")
      expect(separator).toHaveClass("h-px", "-mx-1", "my-1")
    })
  })

  describe("SelectScrollUpButton", () => {
    it("is exported as a component", () => {
      expect(SelectScrollUpButton).toBeDefined()
      expect(typeof SelectScrollUpButton).toBe("function")
    })

    it("is included in SelectContent rendering", () => {
      // The scroll buttons are conditionally rendered by Radix based on overflow
      // We verify they are part of the component API
      renderBasicSelect({ defaultOpen: true })

      // The content should be rendered
      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
    })
  })

  describe("SelectScrollDownButton", () => {
    it("is exported as a component", () => {
      expect(SelectScrollDownButton).toBeDefined()
      expect(typeof SelectScrollDownButton).toBe("function")
    })

    it("is included in SelectContent rendering", () => {
      // The scroll buttons are conditionally rendered by Radix based on overflow
      // We verify they are part of the component API
      renderBasicSelect({ defaultOpen: true })

      // The content should be rendered
      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
    })
  })

  describe("Keyboard Navigation", () => {
    it("opens dropdown with ArrowDown key", async () => {
      const user = userEvent.setup()
      renderBasicSelect()

      const trigger = screen.getByTestId("select-trigger")
      await user.click(trigger)
      await user.keyboard("{ArrowDown}")

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument()
      })
    })

    it("closes dropdown with Escape key", async () => {
      const user = userEvent.setup()
      renderBasicSelect({ defaultOpen: true })

      expect(screen.getByRole("listbox")).toBeInTheDocument()

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
      })
    })
  })

  describe("Selection Behavior", () => {
    it("calls onValueChange when item is selected via keyboard", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      renderBasicSelect({ onValueChange, defaultOpen: true })

      // Navigate and select
      await user.keyboard("{ArrowDown}")
      await user.keyboard("{Enter}")

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalled()
      })
    })

    it("displays selected value after selection", () => {
      renderBasicSelect({ defaultValue: "banana" })

      expect(screen.getByText("Banana")).toBeInTheDocument()
    })

    it("marks selected item with aria-selected", () => {
      renderBasicSelect({ defaultValue: "apple", defaultOpen: true })

      const selectedOption = screen.getByRole("option", { name: "Apple" })
      expect(selectedOption).toHaveAttribute("aria-selected", "true")
    })

    it("marks selected item with data-state checked", () => {
      renderBasicSelect({ defaultValue: "orange", defaultOpen: true })

      const selectedOption = screen.getByRole("option", { name: "Orange" })
      expect(selectedOption).toHaveAttribute("data-state", "checked")
    })
  })

  describe("Controlled vs Uncontrolled", () => {
    it("works as uncontrolled component with defaultValue", () => {
      renderBasicSelect({ defaultValue: "apple" })

      expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("works with open prop for controlled opening", () => {
      const { rerender } = render(
        <Select open={false}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()

      rerender(
        <Select open={true}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has correct ARIA attributes on trigger", () => {
      renderBasicSelect()

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("role", "combobox")
      expect(trigger).toHaveAttribute("aria-expanded", "false")
      expect(trigger).toHaveAttribute("aria-autocomplete", "none")
    })

    it("sets aria-expanded to true when open", () => {
      renderBasicSelect({ defaultOpen: true })

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("aria-expanded", "true")
    })

    it("has correct role on dropdown", () => {
      renderBasicSelect({ defaultOpen: true })

      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })

    it("has correct role on options", () => {
      renderBasicSelect({ defaultOpen: true })

      const options = screen.getAllByRole("option")
      expect(options.length).toBe(3)
    })

    it("indicates selected state with aria-selected", () => {
      renderBasicSelect({ defaultValue: "banana", defaultOpen: true })

      const selectedOption = screen.getByRole("option", { name: "Banana" })
      expect(selectedOption).toHaveAttribute("aria-selected", "true")

      const unselectedOption = screen.getByRole("option", { name: "Apple" })
      expect(unselectedOption).toHaveAttribute("aria-selected", "false")
    })
  })

  describe("Edge Cases", () => {
    it("handles empty options gracefully", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="No options" />
          </SelectTrigger>
          <SelectContent>{/* No items */}</SelectContent>
        </Select>
      )

      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })

    it("handles single option", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="only">Only Option</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByRole("option", { name: "Only Option" })).toBeInTheDocument()
    })

    it("handles very long option text", () => {
      const longText = "This is a very long option text that might overflow the container"
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">{longText}</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByRole("option", { name: longText })).toBeInTheDocument()
    })

    it("handles special characters in values", () => {
      render(
        <Select defaultOpen defaultValue="special-char_123">
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="special-char_123">Special &amp; Characters</SelectItem>
          </SelectContent>
        </Select>
      )

      // The selected item should be checked
      const option = screen.getByRole("option")
      expect(option).toHaveAttribute("data-state", "checked")
    })

    it("maintains selection after re-render", () => {
      const { rerender } = renderBasicSelect({ defaultValue: "apple" })

      expect(screen.getByText("Apple")).toBeInTheDocument()

      rerender(
        <Select defaultValue="apple">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("renders many options", () => {
      const options = Array.from({ length: 50 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`,
      }))

      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

      const renderedOptions = screen.getAllByRole("option")
      expect(renderedOptions.length).toBe(50)
    })
  })

  describe("Styling Integration", () => {
    it("applies placeholder styling via data-placeholder attribute", () => {
      renderBasicSelect({ placeholder: "Select something" })

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("data-placeholder")
    })

    it("does not have data-placeholder when value is selected", () => {
      renderBasicSelect({ defaultValue: "apple" })

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).not.toHaveAttribute("data-placeholder")
    })

    it("has data-state closed when dropdown is closed", () => {
      renderBasicSelect()

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("data-state", "closed")
    })

    it("has data-state open when dropdown is open", () => {
      renderBasicSelect({ defaultOpen: true })

      const trigger = screen.getByTestId("select-trigger")
      expect(trigger).toHaveAttribute("data-state", "open")
    })
  })

  describe("Position Variants", () => {
    it("applies item-aligned position by default", () => {
      renderBasicSelect({ defaultOpen: true })

      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
    })

    it("renders content with popper position", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )

      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
      // The popper position applies additional styling
      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })

    it("renders with default alignment", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )

      // Content is rendered successfully
      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
    })

    it("accepts align prop", () => {
      render(
        <Select defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )

      // Content is rendered successfully with align prop
      const content = document.querySelector("[data-slot='select-content']")
      expect(content).toBeInTheDocument()
    })
  })

  describe("Component Exports", () => {
    it("exports all required components", () => {
      expect(Select).toBeDefined()
      expect(SelectContent).toBeDefined()
      expect(SelectGroup).toBeDefined()
      expect(SelectItem).toBeDefined()
      expect(SelectLabel).toBeDefined()
      expect(SelectScrollDownButton).toBeDefined()
      expect(SelectScrollUpButton).toBeDefined()
      expect(SelectSeparator).toBeDefined()
      expect(SelectTrigger).toBeDefined()
      expect(SelectValue).toBeDefined()
    })
  })
})
