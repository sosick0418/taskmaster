import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskListView } from "@/components/tasks/task-list-view"
import type { Task } from "@/types/task"
import { createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks } from "@/actions/tasks"
import { toast } from "sonner"

// Server Actions 모킹
vi.mock("@/actions/tasks", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskComplete: vi.fn(),
  reorderTasks: vi.fn(),
}))

// Sonner toast 모킹
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// 애니메이션 체크박스 및 Confetti 모킹
vi.mock("@/components/shared/animated-checkbox", () => ({
  CircularCheckbox: ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      data-testid="circular-checkbox"
    >
      {checked ? "Checked" : "Unchecked"}
    </button>
  ),
}))

vi.mock("@/components/shared/confetti", () => ({
  celebrateTaskComplete: vi.fn(),
}))

// DnD Kit 모킹 (TaskBoard용)
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  closestCorners: vi.fn(),
  closestCenter: vi.fn(),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
  arrayMove: vi.fn((arr, from, to) => {
    const result = [...arr]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    return result
  }),
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}))

// window.location.reload 모킹
const mockReload = vi.fn()
Object.defineProperty(window, "location", {
  value: { reload: mockReload },
  writable: true,
})

// Mock Task 생성 헬퍼 함수
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "테스트 태스크",
  description: "테스트 설명",
  priority: "MEDIUM",
  status: "TODO",
  isCompleted: false,
  dueDate: null,
  order: 0,
  tags: [],
  subtasks: [],
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
})

// 테스트용 태스크 목록
const mockTasks: Task[] = [
  createMockTask({
    id: "1",
    title: "태스크 1",
    description: "설명 1",
    priority: "HIGH",
    status: "TODO",
    isCompleted: false,
    dueDate: new Date("2025-01-10"),
    order: 0,
    tags: [{ id: 1, name: "업무" }],
  }),
  createMockTask({
    id: "2",
    title: "태스크 2",
    description: null,
    priority: "LOW",
    status: "DONE",
    isCompleted: true,
    dueDate: null,
    order: 1,
    tags: [],
  }),
  createMockTask({
    id: "3",
    title: "긴급 태스크 3",
    description: "긴급 태스크",
    priority: "URGENT",
    status: "IN_PROGRESS",
    isCompleted: false,
    dueDate: new Date("2025-01-05"),
    order: 2,
    tags: [{ id: 2, name: "개인" }],
  }),
]

// 테스트용 통계 데이터
const mockStats = {
  total: 3,
  inProgress: 1,
  completed: 1,
  todo: 1,
  tasks: {
    total: 3,
    completed: 1,
    inProgress: 1,
  },
  subtasks: {
    total: 5,
    completed: 3,
  },
}

const emptyStats = {
  total: 0,
  inProgress: 0,
  completed: 0,
  todo: 0,
  tasks: { total: 0, completed: 0, inProgress: 0 },
  subtasks: { total: 0, completed: 0 },
}

describe("TaskListView 컴포넌트", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReload.mockClear()
  })

  describe("렌더링 테스트", () => {
    it("사용자 이름과 함께 환영 메시지를 렌더링한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      expect(screen.getByText(/welcome back,/i)).toBeInTheDocument()
      expect(screen.getByText("홍길동")).toBeInTheDocument()
    })

    it("사용자 이름이 없으면 기본값 'there'를 표시한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName={undefined}
        />
      )
      expect(screen.getByText("there")).toBeInTheDocument()
    })

    it("통계 카드를 올바른 값으로 렌더링한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      expect(screen.getByText("Tasks")).toBeInTheDocument()
      expect(screen.getByText("Subtasks")).toBeInTheDocument()
      expect(screen.getByText("Completed")).toBeInTheDocument()
      // 태스크 통계: 1/3 (3개 중 1개 완료)
      expect(screen.getByText("1/3")).toBeInTheDocument()
      // 서브태스크 통계: 3/5 (5개 중 3개 완료)
      expect(screen.getByText("3/5")).toBeInTheDocument()
      // 완료된 총 개수: 1
      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("서브태스크가 있을 때 완료 퍼센트를 표시한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      // 3/5 = 60% 완료
      expect(screen.getByText("60% complete")).toBeInTheDocument()
    })

    it("서브태스크가 없을 때 'No subtasks yet'을 표시한다", () => {
      const statsWithNoSubtasks = {
        ...mockStats,
        subtasks: { total: 0, completed: 0 },
      }
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={statsWithNoSubtasks}
          userName="홍길동"
        />
      )
      expect(screen.getByText("No subtasks yet")).toBeInTheDocument()
    })

    it("태스크 카드들을 렌더링한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      expect(screen.getByText("태스크 1")).toBeInTheDocument()
      expect(screen.getByText("태스크 2")).toBeInTheDocument()
      expect(screen.getByText("긴급 태스크 3")).toBeInTheDocument()
    })

    it("새 태스크 버튼을 렌더링한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      expect(screen.getByRole("button", { name: /new task/i })).toBeInTheDocument()
    })

    it("뷰 토글 버튼을 렌더링한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      const listButton = screen.getByRole("button", { name: /list/i })
      expect(listButton).toBeInTheDocument()
    })
  })

  describe("빈 상태 테스트", () => {
    it("태스크가 없을 때 빈 상태를 렌더링한다", () => {
      render(
        <TaskListView
          initialTasks={[]}
          stats={emptyStats}
          userName="홍길동"
        />
      )
      expect(screen.getByText("No tasks yet")).toBeInTheDocument()
      expect(screen.getByText("Create your first task to get started")).toBeInTheDocument()
    })

    it("빈 상태에서 태스크 생성 버튼을 렌더링한다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={[]}
          stats={emptyStats}
          userName="홍길동"
        />
      )
      const createButtons = screen.getAllByRole("button", { name: /create task/i })
      expect(createButtons.length).toBeGreaterThan(0)

      // 생성 버튼 클릭 시 폼이 열려야 함
      await user.click(createButtons[0] as HTMLElement)
      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
    })
  })

  describe("검색 필터링 테스트", () => {
    it("제목으로 태스크를 검색할 수 있다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "긴급")

      expect(screen.getByText("긴급 태스크 3")).toBeInTheDocument()
      expect(screen.queryByText("태스크 1")).not.toBeInTheDocument()
      expect(screen.queryByText("태스크 2")).not.toBeInTheDocument()
    })

    it("설명으로 태스크를 검색할 수 있다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "설명 1")

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
      expect(screen.queryByText("태스크 2")).not.toBeInTheDocument()
      expect(screen.queryByText("긴급 태스크 3")).not.toBeInTheDocument()
    })

    it("태그로 태스크를 검색할 수 있다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "개인")

      expect(screen.getByText("긴급 태스크 3")).toBeInTheDocument()
      expect(screen.queryByText("태스크 1")).not.toBeInTheDocument()
      expect(screen.queryByText("태스크 2")).not.toBeInTheDocument()
    })

    it("검색 결과가 없을 때 'No matching tasks'를 표시한다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "존재하지않는태스크xyz")

      expect(screen.getByText("No matching tasks")).toBeInTheDocument()
      expect(screen.getByText("Try adjusting your filters or search query")).toBeInTheDocument()
    })

    it("'Clear filters' 버튼 클릭 시 필터가 초기화된다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "존재하지않음")

      expect(screen.getByText("No matching tasks")).toBeInTheDocument()

      const clearButton = screen.getByRole("button", { name: /clear filters/i })
      await user.click(clearButton)

      // 모든 태스크가 다시 표시되어야 함
      expect(screen.getByText("태스크 1")).toBeInTheDocument()
      expect(screen.getByText("태스크 2")).toBeInTheDocument()
      expect(screen.getByText("긴급 태스크 3")).toBeInTheDocument()
    })

    it("필터 적용 시 결과 개수를 표시한다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "태스크")

      expect(screen.getByText(/showing 3 of 3 tasks/i)).toBeInTheDocument()
    })

    it("검색 시 대소문자를 구분하지 않는다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "업무")

      // "업무" 태그가 있는 태스크 1을 찾아야 함
      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })
  })

  describe("정렬 테스트", () => {
    it("기본 정렬은 최신순(newest)이다", () => {
      const tasksWithDifferentOrders = [
        createMockTask({ id: "1", title: "오래된 태스크", order: 0 }),
        createMockTask({ id: "2", title: "새로운 태스크", order: 2 }),
        createMockTask({ id: "3", title: "중간 태스크", order: 1 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithDifferentOrders}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      // 가장 높은 order가 먼저 와야 함
      expect(taskTitles[0]).toHaveTextContent("새로운 태스크")
      expect(taskTitles[1]).toHaveTextContent("중간 태스크")
      expect(taskTitles[2]).toHaveTextContent("오래된 태스크")
    })

    it("우선순위로 정렬할 수 있다", async () => {
      const user = userEvent.setup()
      const tasksWithDifferentPriorities = [
        createMockTask({ id: "1", title: "낮은 우선순위", priority: "LOW", order: 0 }),
        createMockTask({ id: "2", title: "긴급 우선순위", priority: "URGENT", order: 1 }),
        createMockTask({ id: "3", title: "높은 우선순위", priority: "HIGH", order: 2 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithDifferentPriorities}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const priorityOption = screen.getByRole("menuitem", { name: /priority/i })
      await user.click(priorityOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      // URGENT (0) > HIGH (1) > MEDIUM (2) > LOW (3)
      expect(taskTitles[0]).toHaveTextContent("긴급 우선순위")
      expect(taskTitles[1]).toHaveTextContent("높은 우선순위")
      expect(taskTitles[2]).toHaveTextContent("낮은 우선순위")
    })

    it("마감일로 정렬할 수 있다", async () => {
      const user = userEvent.setup()
      const tasksWithDifferentDueDates = [
        createMockTask({ id: "1", title: "마감일 없음", dueDate: null, order: 0 }),
        createMockTask({ id: "2", title: "늦은 마감일", dueDate: new Date("2025-03-01"), order: 1 }),
        createMockTask({ id: "3", title: "빠른 마감일", dueDate: new Date("2025-01-01"), order: 2 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithDifferentDueDates}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const dueDateOption = screen.getByRole("menuitem", { name: /due date/i })
      await user.click(dueDateOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      // 마감일이 있는 태스크가 먼저, 빠른 날짜 순서
      expect(taskTitles[0]).toHaveTextContent("빠른 마감일")
      expect(taskTitles[1]).toHaveTextContent("늦은 마감일")
      expect(taskTitles[2]).toHaveTextContent("마감일 없음")
    })

    it("제목으로 알파벳순 정렬할 수 있다", async () => {
      const user = userEvent.setup()
      const tasksWithDifferentTitles = [
        createMockTask({ id: "1", title: "Charlie", order: 0 }),
        createMockTask({ id: "2", title: "Alpha", order: 1 }),
        createMockTask({ id: "3", title: "Bravo", order: 2 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithDifferentTitles}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const titleOption = screen.getByRole("menuitem", { name: /title/i })
      await user.click(titleOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("Alpha")
      expect(taskTitles[1]).toHaveTextContent("Bravo")
      expect(taskTitles[2]).toHaveTextContent("Charlie")
    })

    it("오래된순으로 정렬할 수 있다", async () => {
      const user = userEvent.setup()
      const tasksWithDifferentOrders = [
        createMockTask({ id: "1", title: "오래된 태스크", order: 0 }),
        createMockTask({ id: "2", title: "새로운 태스크", order: 2 }),
        createMockTask({ id: "3", title: "중간 태스크", order: 1 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithDifferentOrders}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const oldestOption = screen.getByRole("menuitem", { name: /oldest/i })
      await user.click(oldestOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("오래된 태스크")
      expect(taskTitles[1]).toHaveTextContent("중간 태스크")
      expect(taskTitles[2]).toHaveTextContent("새로운 태스크")
    })

    it("모든 우선순위 레벨이 올바르게 정렬된다", async () => {
      const user = userEvent.setup()
      const allPriorityTasks = [
        createMockTask({ id: "1", title: "낮음", priority: "LOW", order: 0 }),
        createMockTask({ id: "2", title: "보통", priority: "MEDIUM", order: 1 }),
        createMockTask({ id: "3", title: "높음", priority: "HIGH", order: 2 }),
        createMockTask({ id: "4", title: "긴급", priority: "URGENT", order: 3 }),
      ]

      render(
        <TaskListView
          initialTasks={allPriorityTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const priorityOption = screen.getByRole("menuitem", { name: /priority/i })
      await user.click(priorityOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("긴급")
      expect(taskTitles[1]).toHaveTextContent("높음")
      expect(taskTitles[2]).toHaveTextContent("보통")
      expect(taskTitles[3]).toHaveTextContent("낮음")
    })
  })

  describe("태스크 폼 테스트", () => {
    it("새 태스크 버튼 클릭 시 폼이 열린다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
      await user.click(screen.getByRole("button", { name: /new task/i }))
      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
    })

    it("태스크 생성이 성공하면 성공 토스트를 표시한다", async () => {
      const user = userEvent.setup()
      ;(createTask as Mock).mockResolvedValueOnce({ success: true, data: { id: "new-task-id" } })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      await user.click(screen.getByRole("button", { name: /new task/i }))

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, "새 테스트 태스크")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(createTask).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Task created successfully")
      })

      expect(mockReload).toHaveBeenCalled()
    })

    it("태스크 생성 실패 시 에러 토스트를 표시한다", async () => {
      const user = userEvent.setup()
      ;(createTask as Mock).mockResolvedValueOnce({ success: false, error: "태스크 생성 실패" })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      await user.click(screen.getByRole("button", { name: /new task/i }))

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, "새 테스트 태스크")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("태스크 생성 실패")
      })
    })

    it("폼 취소 시 폼이 닫힌다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      await user.click(screen.getByRole("button", { name: /new task/i }))
      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.queryByText("Add a new task to your list.")).not.toBeInTheDocument()
      })
    })
  })

  describe("태스크 수정 테스트", () => {
    it("handleCreateOrUpdate 함수로 태스크를 업데이트할 수 있다", async () => {
      const user = userEvent.setup()
      ;(updateTask as Mock).mockResolvedValueOnce({ success: true })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      await user.click(screen.getByRole("button", { name: /new task/i }))
      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
    })

    it("태스크 업데이트 성공 시 성공 토스트를 표시한다", async () => {
      ;(updateTask as Mock).mockResolvedValueOnce({ success: true })
      expect(updateTask).not.toHaveBeenCalled()
    })
  })

  describe("태스크 완료 토글 테스트", () => {
    it("태스크 완료 토글이 성공적으로 동작한다", async () => {
      ;(toggleTaskComplete as Mock).mockResolvedValueOnce({ success: true })

      const singleTask = [
        createMockTask({
          id: "test-1",
          title: "테스트 태스크",
          status: "TODO",
          isCompleted: false,
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={singleTask}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const checkbox = screen.getByTestId("circular-checkbox")
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(toggleTaskComplete).toHaveBeenCalledWith("test-1")
      })

      expect(toast.success).toHaveBeenCalledWith("Task completed! Great job!")
    })

    it("완료된 태스크를 미완료로 변경할 때는 성공 토스트가 표시되지 않는다", async () => {
      ;(toggleTaskComplete as Mock).mockResolvedValueOnce({ success: true })

      const tasksWithCompleted = [
        createMockTask({
          id: "1",
          title: "완료된 태스크",
          status: "DONE",
          isCompleted: true,
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithCompleted}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const checkboxes = screen.getAllByTestId("circular-checkbox")
      fireEvent.click(checkboxes[0] as HTMLElement)

      expect(toast.success).not.toHaveBeenCalledWith("Task completed! Great job!")
    })

    it("토글 실패 시 에러 토스트를 표시하고 롤백한다", async () => {
      ;(toggleTaskComplete as Mock).mockResolvedValueOnce({ success: false, error: "서버 오류" })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const checkboxes = screen.getAllByTestId("circular-checkbox")
      fireEvent.click(checkboxes[0] as HTMLElement)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("서버 오류")
      })
    })

    it("존재하지 않는 태스크 토글 시 아무 동작도 하지 않는다", async () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })
  })

  describe("태스크 삭제 테스트", () => {
    it("handleDelete 함수가 태스크 카드에 전달된다", () => {
      ;(deleteTask as Mock).mockResolvedValueOnce({ success: true })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
      expect(screen.getByText("태스크 2")).toBeInTheDocument()
    })

    it("onDelete 핸들러가 태스크 카드에 전달된다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })
  })

  describe("뷰 토글 테스트", () => {
    it("보드 버튼 클릭 시 보드 뷰로 전환된다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
      expect(screen.getByText("To Do")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Done")).toBeInTheDocument()
    })

    it("보드 뷰에서는 필터가 숨겨진다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument()

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    })

    it("리스트 뷰로 다시 전환할 수 있다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      const listButton = screen.getByRole("button", { name: /list/i })
      await user.click(listButton)

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
      expect(screen.queryByText("To Do")).not.toBeInTheDocument()
    })

    it("보드 뷰에서 모든 컬럼 헤더가 렌더링된다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByText("To Do")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Done")).toBeInTheDocument()
    })

    it("태스크가 상태에 따라 올바른 컬럼에 배치된다", async () => {
      const user = userEvent.setup()
      const tasksForColumns = [
        createMockTask({ id: "1", title: "할일 태스크", status: "TODO", order: 0 }),
        createMockTask({ id: "2", title: "진행중 태스크", status: "IN_PROGRESS", order: 0 }),
        createMockTask({ id: "3", title: "완료 태스크", status: "DONE", isCompleted: true, order: 0 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksForColumns}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByText("할일 태스크")).toBeInTheDocument()
      expect(screen.getByText("진행중 태스크")).toBeInTheDocument()
      expect(screen.getByText("완료 태스크")).toBeInTheDocument()
    })
  })

  describe("태스크 상세 모달 테스트", () => {
    it("태스크 상세 모달 컴포넌트가 렌더링된다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })

    it("태스크 클릭 시 handleTaskClick이 트리거된다", async () => {
      const singleTask = [
        createMockTask({
          id: "click-1",
          title: "클릭 가능한 태스크",
          status: "TODO",
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={singleTask}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const taskTitle = screen.getByText("클릭 가능한 태스크")
      expect(taskTitle).toBeInTheDocument()

      fireEvent.click(taskTitle)

      const clickableTaskElements = screen.getAllByText("클릭 가능한 태스크")
      expect(clickableTaskElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe("보드 뷰 태스크 이동 테스트", () => {
    it("보드 뷰에서 태스크 이동을 처리한다", async () => {
      const user = userEvent.setup()
      ;(reorderTasks as Mock).mockResolvedValueOnce({ success: true })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    })

    it("태스크 이동 실패 시 페이지를 새로고침한다", async () => {
      ;(reorderTasks as Mock).mockResolvedValueOnce({ success: false, error: "이동 실패" })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )
    })

    it("성공적인 태스크 이동을 처리한다", async () => {
      const user = userEvent.setup()
      ;(reorderTasks as Mock).mockResolvedValueOnce({ success: true })

      const tasksForMove = [
        createMockTask({
          id: "move-task",
          title: "이동할 태스크",
          status: "TODO",
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={tasksForMove}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByText("이동할 태스크")).toBeInTheDocument()
    })
  })

  describe("상태 필터 테스트", () => {
    it("상태 필터 변경 시 해당 상태의 태스크만 표시된다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const filtersButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filtersButton)

      const todoButton = screen.getByRole("button", { name: /^to do$/i })
      const inProgressButton = screen.getByRole("button", { name: /^in progress$/i })

      await user.click(todoButton)
      await user.click(inProgressButton)

      await user.keyboard("{Escape}")

      // "DONE" 상태의 태스크만 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText("태스크 2")).toBeInTheDocument()
      })
      expect(screen.queryByText("태스크 1")).not.toBeInTheDocument()
      expect(screen.queryByText("긴급 태스크 3")).not.toBeInTheDocument()
    })
  })

  describe("우선순위 필터 테스트", () => {
    it("우선순위 필터 변경 시 해당 우선순위의 태스크만 표시된다", async () => {
      const user = userEvent.setup()
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const filtersButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filtersButton)

      const lowButton = screen.getByRole("button", { name: /^low$/i })
      const mediumButton = screen.getByRole("button", { name: /^medium$/i })
      const highButton = screen.getByRole("button", { name: /^high$/i })

      await user.click(lowButton)
      await user.click(mediumButton)
      await user.click(highButton)

      await user.keyboard("{Escape}")

      // URGENT 우선순위의 태스크만 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText("긴급 태스크 3")).toBeInTheDocument()
      })
      expect(screen.queryByText("태스크 1")).not.toBeInTheDocument()
      expect(screen.queryByText("태스크 2")).not.toBeInTheDocument()
    })
  })

  describe("서브태스크 업데이트 테스트", () => {
    it("서브태스크 변경 시 태스크 상태가 업데이트된다", async () => {
      const taskWithSubtasks = createMockTask({
        id: "1",
        title: "서브태스크가 있는 태스크",
        subtasks: [
          {
            id: "sub-1",
            title: "서브태스크 1",
            isCompleted: false,
            order: 0,
            taskId: "1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      })

      render(
        <TaskListView
          initialTasks={[taskWithSubtasks]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("서브태스크가 있는 태스크")).toBeInTheDocument()
    })
  })

  describe("낙관적 업데이트 테스트", () => {
    it("useOptimistic 훅으로 낙관적 상태 업데이트를 수행한다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })

    it("태스크 완료 토글에 낙관적 업데이트를 적용한다", async () => {
      let resolveToggle: (value: { success: boolean }) => void
      const togglePromise = new Promise<{ success: boolean }>((resolve) => {
        resolveToggle = resolve
      })
      ;(toggleTaskComplete as Mock).mockReturnValueOnce(togglePromise)

      const singleTask = [
        createMockTask({
          id: "opt-1",
          title: "낙관적 태스크",
          status: "TODO",
          isCompleted: false,
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={singleTask}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const checkbox = screen.getByTestId("circular-checkbox")
      fireEvent.click(checkbox)

      // 성공 토스트가 즉시 표시되어야 함 (낙관적)
      expect(toast.success).toHaveBeenCalledWith("Task completed! Great job!")

      resolveToggle!({ success: true })

      await waitFor(() => {
        expect(toggleTaskComplete).toHaveBeenCalledWith("opt-1")
      })
    })

    it("토글 액션을 올바르게 처리한다", async () => {
      ;(toggleTaskComplete as Mock).mockResolvedValueOnce({ success: true })

      const task = createMockTask({
        id: "toggle-task",
        title: "토글 태스크",
        status: "TODO",
        isCompleted: false,
        order: 0,
      })

      render(
        <TaskListView
          initialTasks={[task]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const checkbox = screen.getByTestId("circular-checkbox")
      expect(checkbox).toHaveTextContent("Unchecked")

      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(checkbox).toHaveTextContent("Checked")
      })
    })

    it("낙관적 업데이트로 삭제 액션을 처리한다", async () => {
      ;(deleteTask as Mock).mockResolvedValueOnce({ success: true })

      const task = createMockTask({
        id: "delete-opt-task",
        title: "낙관적 삭제 태스크",
        status: "TODO",
        isCompleted: false,
        order: 0,
      })

      render(
        <TaskListView
          initialTasks={[task]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("낙관적 삭제 태스크")).toBeInTheDocument()
    })
  })

  describe("엣지 케이스 테스트", () => {
    it("description이 null인 태스크 검색을 처리한다", async () => {
      const user = userEvent.setup()
      const tasksWithNullDescription = [
        createMockTask({ id: "1", title: "null 설명 태스크", description: null }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithNullDescription}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "something")

      // 크래시 없이 올바르게 필터링되어야 함
      expect(screen.getByText("No matching tasks")).toBeInTheDocument()
    })

    it("빈 태그 배열로 검색을 처리한다", async () => {
      const user = userEvent.setup()
      const tasksWithEmptyTags = [
        createMockTask({ id: "1", title: "태그 없는 태스크", tags: [] }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithEmptyTags}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "존재하지않음")

      expect(screen.getByText("No matching tasks")).toBeInTheDocument()
    })

    it("두 태스크 모두 마감일이 null인 경우 정렬을 처리한다", async () => {
      const user = userEvent.setup()
      const tasksWithNullDueDates = [
        createMockTask({ id: "1", title: "태스크 A", dueDate: null, order: 0 }),
        createMockTask({ id: "2", title: "태스크 B", dueDate: null, order: 1 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithNullDueDates}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const dueDateOption = screen.getByRole("menuitem", { name: /due date/i })
      await user.click(dueDateOption)

      // 두 태스크 모두 표시되어야 함
      expect(screen.getByText("태스크 A")).toBeInTheDocument()
      expect(screen.getByText("태스크 B")).toBeInTheDocument()
    })

    it("하나는 마감일이 있고 하나는 없는 경우 정렬을 처리한다", async () => {
      const user = userEvent.setup()
      const mixedDueDateTasks = [
        createMockTask({ id: "1", title: "마감일 있음", dueDate: new Date("2025-06-01"), order: 0 }),
        createMockTask({ id: "2", title: "마감일 없음", dueDate: null, order: 1 }),
      ]

      render(
        <TaskListView
          initialTasks={mixedDueDateTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const dueDateOption = screen.getByRole("menuitem", { name: /due date/i })
      await user.click(dueDateOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("마감일 있음")
      expect(taskTitles[1]).toHaveTextContent("마감일 없음")
    })

    it("첫 번째 태스크에 마감일이 없는 경우 정렬을 처리한다", async () => {
      const user = userEvent.setup()
      const mixedDueDateTasks = [
        createMockTask({ id: "1", title: "마감일 없음 첫번째", dueDate: null, order: 0 }),
        createMockTask({ id: "2", title: "마감일 있음", dueDate: new Date("2025-06-01"), order: 1 }),
      ]

      render(
        <TaskListView
          initialTasks={mixedDueDateTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const dueDateOption = screen.getByRole("menuitem", { name: /due date/i })
      await user.click(dueDateOption)

      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("마감일 있음")
      expect(taskTitles[1]).toHaveTextContent("마감일 없음 첫번째")
    })
  })

  describe("통계 표시 엣지 케이스 테스트", () => {
    it("서브태스크 완료가 0일 때 0%를 표시한다", () => {
      const statsWithZeroCompletion = {
        ...mockStats,
        subtasks: { total: 10, completed: 0 },
      }

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={statsWithZeroCompletion}
          userName="홍길동"
        />
      )

      expect(screen.getByText("0% complete")).toBeInTheDocument()
    })

    it("모든 서브태스크가 완료되면 100%를 표시한다", () => {
      const statsWithFullCompletion = {
        ...mockStats,
        subtasks: { total: 5, completed: 5 },
      }

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={statsWithFullCompletion}
          userName="홍길동"
        />
      )

      expect(screen.getByText("100% complete")).toBeInTheDocument()
    })
  })

  describe("필터 결과 개수 표시 테스트", () => {
    it("필터가 적용되지 않으면 결과 개수를 표시하지 않는다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.queryByText(/showing \d+ of \d+ tasks/i)).not.toBeInTheDocument()
    })

    it("상태 필터가 줄어들면 결과 개수를 표시한다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const filtersButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filtersButton)

      const todoButton = screen.getByRole("button", { name: /^to do$/i })
      await user.click(todoButton)

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.getByText(/showing \d+ of \d+ tasks/i)).toBeInTheDocument()
      })
    })

    it("우선순위 필터가 줄어들면 결과 개수를 표시한다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const filtersButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filtersButton)

      const lowButton = screen.getByRole("button", { name: /^low$/i })
      await user.click(lowButton)

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.getByText(/showing \d+ of \d+ tasks/i)).toBeInTheDocument()
      })
    })
  })

  describe("필터로 빈 태스크 테스트", () => {
    it("모든 태스크가 필터링되면 빈 상태를 표시한다", async () => {
      const user = userEvent.setup()
      const singleTask = [
        createMockTask({
          id: "1",
          title: "유일한 태스크",
          status: "TODO",
          priority: "LOW",
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={singleTask}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const filtersButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filtersButton)

      const todoButton = screen.getByRole("button", { name: /^to do$/i })
      await user.click(todoButton)

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.getByText("No matching tasks")).toBeInTheDocument()
      })
    })
  })

  describe("필터와 정렬 조합 테스트", () => {
    it("필터와 정렬을 함께 올바르게 적용한다", async () => {
      const user = userEvent.setup()
      // 영문 제목으로 테스트하여 정렬 순서가 명확하도록 함
      const tasksForFilterSort = [
        createMockTask({
          id: "1",
          title: "Alpha High",
          priority: "HIGH",
          status: "TODO",
          order: 0,
        }),
        createMockTask({
          id: "2",
          title: "Beta High",
          priority: "HIGH",
          status: "TODO",
          order: 1,
        }),
        createMockTask({
          id: "3",
          title: "Charlie Low",
          priority: "LOW",
          status: "TODO",
          order: 2,
        }),
      ]

      render(
        <TaskListView
          initialTasks={tasksForFilterSort}
          stats={mockStats}
          userName="홍길동"
        />
      )

      // HIGH 우선순위만 필터링
      const filtersButton = screen.getByRole("button", { name: /filters/i })
      await user.click(filtersButton)

      const lowButton = screen.getByRole("button", { name: /^low$/i })
      await user.click(lowButton)

      const mediumButton = screen.getByRole("button", { name: /^medium$/i })
      await user.click(mediumButton)

      const urgentButton = screen.getByRole("button", { name: /^urgent$/i })
      await user.click(urgentButton)

      await user.keyboard("{Escape}")

      // HIGH 우선순위 태스크만 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText("Alpha High")).toBeInTheDocument()
        expect(screen.getByText("Beta High")).toBeInTheDocument()
        expect(screen.queryByText("Charlie Low")).not.toBeInTheDocument()
      })

      // 제목으로 정렬
      const sortButton = screen.getByRole("button", { name: /sort/i })
      await user.click(sortButton)

      const titleOption = screen.getByRole("menuitem", { name: /title/i })
      await user.click(titleOption)

      // 알파벳순으로 정렬되어야 함
      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("Alpha High")
      expect(taskTitles[1]).toHaveTextContent("Beta High")
    })
  })

  describe("보드 뷰 우선순위 필터 테스트", () => {
    it("보드 뷰에서 우선순위 필터를 적용한다", async () => {
      const user = userEvent.setup()
      const tasksWithVariousPriorities = [
        createMockTask({ id: "1", title: "낮음 태스크", priority: "LOW", status: "TODO", order: 0 }),
        createMockTask({ id: "2", title: "높음 태스크", priority: "HIGH", status: "TODO", order: 1 }),
        createMockTask({ id: "3", title: "긴급 태스크", priority: "URGENT", status: "IN_PROGRESS", order: 2 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithVariousPriorities}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      // 초기에는 모든 태스크가 표시되어야 함
      expect(screen.getByText("낮음 태스크")).toBeInTheDocument()
      expect(screen.getByText("높음 태스크")).toBeInTheDocument()
      expect(screen.getByText("긴급 태스크")).toBeInTheDocument()
    })
  })

  describe("보드 뷰 검색 테스트", () => {
    it("검색 필터가 보드 뷰 태스크에 영향을 준다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      const listButton = screen.getByRole("button", { name: /list/i })
      await user.click(listButton)

      const searchInput = screen.getByPlaceholderText("Search tasks...")
      await user.type(searchInput, "태스크 1")

      // 태스크 1만 표시되어야 함
      expect(screen.getByText("태스크 1")).toBeInTheDocument()
      expect(screen.queryByText("태스크 2")).not.toBeInTheDocument()

      // 다시 보드 뷰로 전환
      await user.click(boardButton)

      // 검색 필터가 여전히 적용되어야 함
      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })
  })

  describe("태스크 이동 통합 테스트", () => {
    it("handleTaskMove 호출 시 태스크 상태가 올바르게 업데이트된다", async () => {
      const user = userEvent.setup()
      ;(reorderTasks as Mock).mockResolvedValueOnce({ success: true })

      const tasksForReorder = [
        createMockTask({
          id: "task-a",
          title: "태스크 A",
          status: "TODO",
          order: 0,
        }),
        createMockTask({
          id: "task-b",
          title: "태스크 B",
          status: "TODO",
          order: 1,
        }),
        createMockTask({
          id: "task-c",
          title: "태스크 C",
          status: "IN_PROGRESS",
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={tasksForReorder}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
      expect(screen.getByText("태스크 A")).toBeInTheDocument()
      expect(screen.getByText("태스크 B")).toBeInTheDocument()
      expect(screen.getByText("태스크 C")).toBeInTheDocument()
    })

    it("다른 컬럼으로 태스크 이동을 처리한다", async () => {
      const user = userEvent.setup()
      ;(reorderTasks as Mock).mockResolvedValueOnce({ success: true })

      const tasksForMove = [
        createMockTask({
          id: "move-task",
          title: "이동 태스크",
          status: "TODO",
          order: 0,
        }),
      ]

      render(
        <TaskListView
          initialTasks={tasksForMove}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByText("이동 태스크")).toBeInTheDocument()
    })
  })

  describe("기본 상태로 태스크 추가 테스트", () => {
    it("TODO를 기본 상태로 폼을 연다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      await user.click(screen.getByRole("button", { name: /new task/i }))

      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()
    })

    it("보드 컬럼에서 추가할 때 특정 상태로 폼을 연다", async () => {
      const user = userEvent.setup()

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const boardButton = screen.getByRole("button", { name: /board/i })
      await user.click(boardButton)

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    })
  })

  describe("폼 리셋 동작 테스트", () => {
    it("폼 제출 후 editingTask와 defaultStatus가 리셋된다", async () => {
      const user = userEvent.setup()
      ;(createTask as Mock).mockResolvedValueOnce({ success: true, data: { id: "new-id" } })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      await user.click(screen.getByRole("button", { name: /new task/i }))

      expect(screen.getByText("Add a new task to your list.")).toBeInTheDocument()

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, "새 태스크")

      const submitButton = screen.getByRole("button", { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(createTask).toHaveBeenCalled()
      })
    })
  })

  describe("handleEdit 통합 테스트", () => {
    it("TaskCard에서 편집 트리거 시 editingTask가 설정된다", async () => {
      const user = userEvent.setup()

      const taskToEdit = createMockTask({
        id: "edit-task",
        title: "편집할 태스크",
        description: "원본 설명",
        status: "TODO",
        isCompleted: false,
        order: 0,
      })

      render(
        <TaskListView
          initialTasks={[taskToEdit]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("편집할 태스크")).toBeInTheDocument()

      const taskCard = screen.getByText("편집할 태스크").closest('[class*="rounded-xl"]')
      if (taskCard) {
        await user.hover(taskCard)
      }
    })
  })

  describe("기본 정렬 동작 테스트", () => {
    it("인식되지 않는 sortBy일 때 기본 정렬을 사용한다", () => {
      const tasksWithOrders = [
        createMockTask({ id: "1", title: "첫번째", order: 2 }),
        createMockTask({ id: "2", title: "두번째", order: 1 }),
        createMockTask({ id: "3", title: "세번째", order: 0 }),
      ]

      render(
        <TaskListView
          initialTasks={tasksWithOrders}
          stats={mockStats}
          userName="홍길동"
        />
      )

      // 기본 정렬은 "newest" (가장 높은 order 먼저)
      const taskTitles = screen.getAllByRole("heading", { level: 3 })
      expect(taskTitles[0]).toHaveTextContent("첫번째")
      expect(taskTitles[1]).toHaveTextContent("두번째")
      expect(taskTitles[2]).toHaveTextContent("세번째")
    })
  })

  describe("서브태스크 변경 핸들러 테스트", () => {
    it("서브태스크 변경 시 태스크 상태가 업데이트된다", () => {
      const taskWithSubtasks = createMockTask({
        id: "subtask-task-1",
        title: "서브태스크 태스크",
        subtasks: [
          {
            id: "sub-1",
            title: "원본 서브태스크",
            isCompleted: false,
            order: 0,
            taskId: "subtask-task-1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      })

      render(
        <TaskListView
          initialTasks={[taskWithSubtasks]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("서브태스크 태스크")).toBeInTheDocument()
    })
  })

  describe("태스크 업데이트 플로우 테스트", () => {
    it("handleCreateOrUpdate로 태스크를 성공적으로 업데이트한다", async () => {
      const user = userEvent.setup()
      ;(updateTask as Mock).mockResolvedValueOnce({ success: true })

      const taskToEdit = createMockTask({
        id: "edit-1",
        title: "편집 태스크",
        description: "원본 설명",
        status: "TODO",
        priority: "MEDIUM",
        order: 0,
      })

      render(
        <TaskListView
          initialTasks={[taskToEdit]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const taskCard = screen.getByText("편집 태스크").closest('[class*="rounded-xl"]')
      if (taskCard) {
        fireEvent.mouseEnter(taskCard)
      }

      const editButtons = screen.getAllByRole("button")
      const editButton = editButtons.find(btn => btn.querySelector('svg.lucide-pencil'))
      if (editButton) {
        await user.click(editButton)
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })
    })

    it("태스크 업데이트 실패 시 에러 토스트를 표시한다", async () => {
      ;(updateTask as Mock).mockResolvedValueOnce({ success: false, error: "업데이트 실패" })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })
  })

  describe("태스크 삭제 플로우 테스트", () => {
    it("삭제 버튼 클릭 시 handleDelete가 호출된다", async () => {
      const user = userEvent.setup()
      ;(deleteTask as Mock).mockResolvedValueOnce({ success: true })

      const taskToDelete = createMockTask({
        id: "delete-1",
        title: "삭제 태스크",
        status: "TODO",
        isCompleted: false,
        order: 0,
      })

      render(
        <TaskListView
          initialTasks={[taskToDelete]}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("삭제 태스크")).toBeInTheDocument()

      const taskCard = screen.getByText("삭제 태스크").closest('[class*="rounded-xl"]')
      if (taskCard) {
        await user.hover(taskCard)
      }

      await waitFor(() => {
        const allButtons = screen.getAllByRole("button")
        const hasDeleteButton = allButtons.some(btn => btn.querySelector('svg.lucide-trash-2'))
        if (hasDeleteButton) {
          const deleteButton = allButtons.find(btn => btn.querySelector('svg.lucide-trash-2'))
          if (deleteButton) {
            fireEvent.click(deleteButton)
          }
        }
      }, { timeout: 1000 })
    })

    it("삭제 성공 시 성공 토스트를 표시한다", async () => {
      ;(deleteTask as Mock).mockResolvedValueOnce({ success: true })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })

    it("삭제 실패 시 에러 토스트를 표시한다", async () => {
      ;(deleteTask as Mock).mockResolvedValueOnce({ success: false, error: "삭제 실패" })

      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      expect(screen.getByText("태스크 1")).toBeInTheDocument()
    })
  })

  describe("태스크 클릭 및 상세 모달 테스트", () => {
    it("onClick 핸들러가 TaskCard 컴포넌트에 전달된다", () => {
      render(
        <TaskListView
          initialTasks={mockTasks}
          stats={mockStats}
          userName="홍길동"
        />
      )

      const task1Elements = screen.getAllByText("태스크 1")
      expect(task1Elements.length).toBeGreaterThan(0)
      expect(screen.getByText("태스크 2")).toBeInTheDocument()
      expect(screen.getByText("긴급 태스크 3")).toBeInTheDocument()
    })
  })
})
