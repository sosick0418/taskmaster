# Taskmaster E2E Test Plan

## Application Overview

Taskmaster is an enterprise-grade Task Manager built with Next.js 16, featuring real-time data operations with strong focus on data integrity and user experience. The application includes:

**Tech Stack:**
- Next.js 16 (App Router) with React Server Components
- TypeScript with end-to-end type safety
- PostgreSQL with Prisma ORM
- Auth.js v5 for authentication (GitHub, Google OAuth + Dev Credentials)
- Tailwind CSS with Framer Motion animations
- dnd-kit for drag-and-drop functionality

**Core Features:**
- Task CRUD operations with Server Actions
- Kanban board with drag & drop
- List view with filtering, sorting, and search
- Subtasks management
- Analytics dashboard with charts and heatmaps
- Notification system with preferences
- Optimistic UI updates for instant feedback
- Confetti celebrations on task completion

**Data Model:**
- Users with OAuth accounts
- Tasks (TODO/IN_PROGRESS/DONE status, LOW/MEDIUM/HIGH/URGENT priority)
- SubTasks with progress tracking
- Tags (many-to-many relationship)
- Notifications with preferences

**Critical Testing Areas:**
- Authentication flows and session management
- Data integrity in CRUD operations
- Real-time UI updates with optimistic rendering
- Drag & drop state synchronization
- Filter/sort/search accuracy
- Subtask progress calculation
- Analytics data accuracy

## Test Scenarios

### 1. Authentication & Session Management

**Seed:** `seed.spec.ts`

#### 1.1. Landing Page Navigation

**File:** `tests/auth/landing-page.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000
  2. Verify landing page loads with hero section and 'Taskmaster' heading
  3. Verify 'Sign in' link is visible in header
  4. Verify 'Get Started' button is visible
  5. Click 'View on GitHub' link and verify it opens in new tab
  6. Scroll down to features section and verify all 5 feature cards are displayed (Kanban Board, Smart Lists, Delightful UX, Lightning Fast, Secure Auth)
  7. Verify footer contains Taskmaster logo and social links

**Expected Results:**
  - Landing page displays stunning animated gradient background with grid pattern
  - All hero elements render correctly with Framer Motion animations
  - GitHub link opens https://github.com/sosick0418/taskmaster in new tab
  - Feature cards display with hover effects and gradient accents
  - CTA section displays 'Ready to boost your productivity' heading
  - Footer renders with working GitHub and Twitter links

#### 1.2. OAuth Login Flow - GitHub

**File:** `tests/auth/github-login.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
  2. Verify login page displays with gradient background and 'Welcome Back' heading
  3. Verify 'Continue with GitHub' button is visible
  4. Verify 'Continue with Google' button is visible
  5. Click 'Continue with GitHub' button
  6. Mock GitHub OAuth callback with test credentials
  7. Verify redirect to /tasks page
  8. Verify user session is established (check user button in header)
  9. Verify user name/email appears in header dropdown

**Expected Results:**
  - Login page renders with animated background and card UI
  - OAuth buttons display correct icons and text
  - GitHub OAuth flow initiates correctly
  - User is successfully authenticated and redirected to dashboard
  - Session persists across page refreshes
  - User avatar and name display in header
  - Logout option available in dropdown menu

#### 1.3. Development Test Login

**File:** `tests/auth/test-login.spec.ts`

**Steps:**
  1. Verify NODE_ENV is set to 'development'
  2. Navigate to http://localhost:3000/login
  3. Verify 'Dev Only' section is visible (separated by divider)
  4. Enter 'test@example.com' in email input field
  5. Click 'Test Login (Dev)' button
  6. Verify redirect to /tasks page
  7. Verify user is authenticated with email 'test@example.com'
  8. Verify user name 'test' appears in header

**Expected Results:**
  - Dev-only credentials provider is available in development
  - Test login button displays with amber styling
  - Test user is created in database if not exists
  - Authentication succeeds without OAuth flow
  - User session is established with test credentials
  - Dashboard loads with test user's tasks (empty on first login)

#### 1.4. Protected Route Access

**File:** `tests/auth/protected-routes.spec.ts`

**Steps:**
  1. Clear all cookies and local storage
  2. Navigate to http://localhost:3000/tasks (without authentication)
  3. Verify redirect to /login page
  4. Navigate to http://localhost:3000/analytics
  5. Verify redirect to /login page
  6. Navigate to http://localhost:3000/settings
  7. Verify redirect to /login page
  8. Perform test login with 'test@example.com'
  9. Navigate to /tasks and verify access is granted
  10. Navigate to /analytics and verify access is granted
  11. Navigate to /settings and verify access is granted

**Expected Results:**
  - Unauthenticated users cannot access protected routes
  - All dashboard routes redirect to /login when not authenticated
  - After login, all protected routes are accessible
  - No error messages or broken UI states
  - Auth middleware correctly enforces authentication
  - Session validation works on all protected routes

#### 1.5. Logout Flow

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Login with test credentials (test@example.com)
  2. Navigate to /tasks page
  3. Click user avatar button in header
  4. Verify dropdown menu opens with user info
  5. Click 'Sign out' button in dropdown
  6. Verify redirect to landing page (/) or login page
  7. Attempt to navigate to /tasks
  8. Verify redirect back to /login
  9. Verify session cookies are cleared

**Expected Results:**
  - User can successfully sign out
  - Session is terminated and cookies are cleared
  - User is redirected to public page after logout
  - Protected routes become inaccessible after logout
  - No user data remains in browser after logout
  - Login page displays correctly after logout

### 2. Task CRUD Operations

**Seed:** `seed.spec.ts`

#### 2.1. Create Task - Basic

**File:** `tests/tasks/create-task-basic.spec.ts`

**Steps:**
  1. Login with test credentials
  2. Navigate to /tasks page
  3. Verify 'No tasks yet' empty state is displayed (if first time)
  4. Click 'New Task' button in header
  5. Verify task form modal opens with title 'Create Task'
  6. Enter 'Buy groceries' in title field
  7. Enter 'Milk, eggs, bread' in description field
  8. Select 'MEDIUM' priority
  9. Keep status as 'TODO' (default)
  10. Click 'Create Task' button
  11. Verify success toast 'Task created successfully' appears
  12. Verify modal closes
  13. Verify new task appears in task list with title 'Buy groceries'
  14. Verify task shows MEDIUM priority badge
  15. Verify task status is TODO

**Expected Results:**
  - Task form opens with all fields empty/default
  - Form validation works (title is required)
  - Task is created in database via Server Action
  - Optimistic UI update shows task immediately
  - Page revalidates and shows actual server data
  - Task count in stats cards updates to 1/1
  - Task displays with correct priority badge color (blue for MEDIUM)
  - Created timestamp shows 'just now' or similar

#### 2.2. Create Task - Full Form

**File:** `tests/tasks/create-task-full.spec.ts`

**Steps:**
  1. Login and navigate to /tasks
  2. Click 'New Task' button
  3. Enter 'Prepare presentation' in title
  4. Enter 'Q4 Sales Review - include charts and metrics' in description
  5. Select 'HIGH' priority
  6. Select 'IN_PROGRESS' status
  7. Click due date picker
  8. Select tomorrow's date
  9. Enter tags: 'work', 'urgent', 'presentation'
  10. Click 'Create Task' button
  11. Verify task appears with all details
  12. Click task to open detail modal
  13. Verify all entered information is displayed correctly
  14. Verify due date shows 'Tomorrow'
  15. Verify tags are displayed with violet styling

**Expected Results:**
  - All form fields accept and save data correctly
  - Due date picker integrates with react-day-picker
  - Tags are created or connected in database (many-to-many)
  - Task appears in 'In Progress' column in board view
  - Priority badge shows HIGH with appropriate color (orange/red)
  - Stats cards update: 1 task in progress
  - Due date formatting works correctly with date-fns
  - Tags display as chips in both list and detail view

#### 2.3. Edit Task

**File:** `tests/tasks/edit-task.spec.ts`

**Steps:**
  1. Login and create a task 'Review code'
  2. Click edit button (pencil icon) on the task card
  3. Verify form opens with existing task data pre-filled
  4. Change title to 'Review PR #123'
  5. Change priority from MEDIUM to URGENT
  6. Add tag 'code-review'
  7. Click 'Update Task' button
  8. Verify success toast 'Task updated successfully'
  9. Verify task card updates immediately (optimistic)
  10. Refresh page and verify changes persisted
  11. Click task to open detail modal
  12. Verify all changes are reflected in detail view

**Expected Results:**
  - Edit form pre-populates with current task data
  - All fields are editable
  - Update operation uses Server Action (updateTask)
  - Optimistic update provides instant feedback
  - Database changes persist across refresh
  - Task order is maintained after edit
  - URGENT priority badge displays correctly (red)
  - Updated timestamp changes to recent time

#### 2.4. Delete Task with Confirmation

**File:** `tests/tasks/delete-task.spec.ts`

**Steps:**
  1. Login and create tasks: 'Task A', 'Task B', 'Task C'
  2. Verify 3 tasks are displayed
  3. Click delete button (trash icon) on 'Task B'
  4. Verify task disappears immediately (optimistic update)
  5. Verify success toast 'Task deleted'
  6. Verify only 'Task A' and 'Task C' remain
  7. Verify stats update to 2 total tasks
  8. Refresh page
  9. Verify 'Task B' is still gone (persisted)
  10. Open 'Task A' detail modal
  11. Click 'Delete' button in modal
  12. Verify modal closes
  13. Verify 'Task A' is removed from list

**Expected Results:**
  - Delete operation works from both list card and detail modal
  - Optimistic UI removes task immediately
  - Server Action completes successfully
  - Database cascade deletes subtasks and relationships
  - Stats cards update automatically
  - No orphaned data remains
  - Remaining tasks maintain correct order
  - No error toasts appear

#### 2.5. Toggle Task Completion

**File:** `tests/tasks/toggle-completion.spec.ts`

**Steps:**
  1. Login and create task 'Complete quarterly report'
  2. Verify task has status TODO and isCompleted: false
  3. Click circular checkbox on task card
  4. Verify confetti animation plays
  5. Verify success toast 'Task completed! Great job!'
  6. Verify checkbox animates to checked state
  7. Verify task title gets strikethrough styling
  8. Verify task status changes to DONE
  9. Verify task moves to 'Done' column in board view
  10. Click checkbox again to uncheck
  11. Verify task returns to TODO status
  12. Verify strikethrough is removed
  13. Verify task moves back to 'To Do' column

**Expected Results:**
  - Completion toggle works with circular animated checkbox
  - Confetti celebration plays using canvas-confetti library
  - Task status automatically updates to DONE when completed
  - isCompleted field syncs with status in database
  - Optimistic update provides instant visual feedback
  - Stats update: completed count increases by 1
  - Un-completing a task reverses all changes
  - Framer Motion animations play smoothly
  - Server Action (toggleTaskComplete) handles state correctly

#### 2.6. Task with Subtasks

**File:** `tests/tasks/task-with-subtasks.spec.ts`

**Steps:**
  1. Login and create task 'Website Redesign'
  2. Click task to open detail modal
  3. In subtasks section, click 'Add subtask' input
  4. Type 'Design mockups' and press Enter
  5. Add second subtask: 'Get feedback'
  6. Add third subtask: 'Implement changes'
  7. Verify all 3 subtasks appear in list
  8. Verify progress bar shows 0/3 completed (0%)
  9. Click checkbox on 'Design mockups' subtask
  10. Verify progress updates to 1/3 (33%)
  11. Verify progress bar fills to 33%
  12. Complete remaining subtasks
  13. Verify progress shows 3/3 (100%)
  14. Close and reopen modal
  15. Verify subtasks persist correctly

**Expected Results:**
  - Subtasks can be added via inline input
  - SubTask model maintains order field
  - Progress calculation is accurate (completed/total)
  - Progress bar animates smoothly with Framer Motion
  - Subtask completion is independent of parent task
  - Subtask data persists in database
  - Stats cards show subtask counts separately
  - Database cascade delete removes subtasks when task deleted
  - Subtask order can be managed (order field)

### 3. Kanban Board & Drag-Drop

**Seed:** `seed.spec.ts`

#### 3.1. Switch to Board View

**File:** `tests/kanban/switch-view.spec.ts`

**Steps:**
  1. Login and navigate to /tasks
  2. Verify default view is 'list' (list icon is active)
  3. Create 3 tasks with different statuses (TODO, IN_PROGRESS, DONE)
  4. Click board view toggle button (grid icon)
  5. Verify view changes to kanban board layout
  6. Verify 3 columns: 'To Do', 'In Progress', 'Done'
  7. Verify tasks appear in correct columns based on status
  8. Click list view toggle
  9. Verify view switches back to list
  10. Verify view preference persists (stored in localStorage)

**Expected Results:**
  - View toggle component switches between list/board modes
  - useViewPreference hook manages state and persistence
  - Board view renders 3 columns with TaskColumn components
  - Tasks are grouped by status correctly
  - View preference persists across page refreshes
  - Both views show same data, just different layouts
  - Filters only apply to list view, not board view
  - Transitions are smooth with no layout shift

#### 3.2. Drag Task Between Columns

**File:** `tests/kanban/drag-between-columns.spec.ts`

**Steps:**
  1. Login and switch to board view
  2. Create task 'Write documentation' with status TODO
  3. Verify task appears in 'To Do' column
  4. Drag task from 'To Do' to 'In Progress' column
  5. Verify task moves to 'In Progress' immediately (optimistic)
  6. Verify task status updates to IN_PROGRESS
  7. Verify stats update: in progress count increases
  8. Drag task to 'Done' column
  9. Verify task status updates to DONE
  10. Verify task isCompleted becomes true
  11. Verify confetti celebrates completion
  12. Refresh page
  13. Verify task remains in 'Done' column

**Expected Results:**
  - dnd-kit library handles drag and drop
  - PointerSensor activates drag with 8px distance threshold
  - DragOverlay shows card preview while dragging
  - Task status updates on drop via reorderTasks Server Action
  - Optimistic update provides instant feedback
  - Database transaction ensures data integrity
  - Task order recalculates in target column
  - Moving to DONE auto-completes the task
  - Stats and progress bars update in real-time

#### 3.3. Reorder Tasks Within Column

**File:** `tests/kanban/reorder-within-column.spec.ts`

**Steps:**
  1. Login and switch to board view
  2. Create 4 tasks in TODO: 'Task A', 'Task B', 'Task C', 'Task D'
  3. Verify tasks appear in creation order (A, B, C, D)
  4. Drag 'Task D' to top of TODO column
  5. Verify order changes to: D, A, B, C
  6. Drag 'Task B' between D and A
  7. Verify order changes to: D, B, A, C
  8. Refresh page
  9. Verify new order persists
  10. Switch to list view
  11. Verify same order is maintained

**Expected Results:**
  - Tasks sort by order field within each status group
  - SortableContext from dnd-kit handles reordering
  - handleDragEnd calculates new order index
  - Server Action updates order for all affected tasks
  - Transaction ensures atomic updates
  - Order field is maintained across status changes
  - List view respects same order as board view
  - No duplicate order values within same status

#### 3.4. Drag Visual Feedback

**File:** `tests/kanban/drag-visual-feedback.spec.ts`

**Steps:**
  1. Login and create task in board view
  2. Start dragging task card
  3. Verify DragOverlay shows rotated, scaled copy of card
  4. Verify original card placeholder remains in column
  5. Hover over different columns while dragging
  6. Verify valid drop zones highlight
  7. Release drag without dropping on valid zone
  8. Verify task returns to original position
  9. Drag and drop on valid zone
  10. Verify smooth animation to new position

**Expected Results:**
  - DragOverlay renders with rotate-3 and scale-105 classes
  - Card preview follows cursor smoothly
  - Source column shows empty space for dragged card
  - closestCorners collision detection finds drop targets
  - Invalid drops cancel the drag operation
  - Valid drops complete with animation
  - No flickering or layout shifts during drag
  - Cursor changes appropriately (grab/grabbing)

#### 3.5. Add Task from Column Header

**File:** `tests/kanban/add-task-from-column.spec.ts`

**Steps:**
  1. Login and switch to board view
  2. Click '+' button in 'In Progress' column header
  3. Verify task form modal opens
  4. Verify status is pre-set to 'IN_PROGRESS'
  5. Enter task title 'Debug API issue'
  6. Click 'Create Task' button
  7. Verify task appears directly in 'In Progress' column
  8. Repeat for 'Done' column
  9. Verify new task appears in 'Done' column with DONE status

**Expected Results:**
  - Each column header has add button
  - onAddTask callback passes column status to form
  - Task form defaultStatus prop controls initial status
  - Created task appears in correct column immediately
  - Order is set to end of column (highest order + 1)
  - No manual status selection needed
  - Improves UX by reducing clicks

### 4. List View Filters & Search

**Seed:** `seed.spec.ts`

#### 4.1. Search Tasks by Title

**File:** `tests/filters/search-title.spec.ts`

**Steps:**
  1. Login and create tasks: 'Buy groceries', 'Buy coffee', 'Sell old furniture'
  2. Switch to list view
  3. Verify all 3 tasks are displayed
  4. Type 'buy' in search input (case-insensitive)
  5. Verify only 'Buy groceries' and 'Buy coffee' are shown
  6. Verify count shows 'Showing 2 of 3 tasks'
  7. Clear search input
  8. Verify all 3 tasks reappear
  9. Type 'furniture'
  10. Verify only 'Sell old furniture' is shown

**Expected Results:**
  - Search is case-insensitive
  - Search filters task list in real-time
  - useMemo recalculates filteredTasks on query change
  - Result count updates dynamically
  - Clearing search restores full list
  - Search input has magnifying glass icon
  - No API calls - filtering happens client-side

#### 4.2. Search Tasks by Description and Tags

**File:** `tests/filters/search-description-tags.spec.ts`

**Steps:**
  1. Create task 'Q1 Planning' with description 'Budget allocation meeting' and tag 'finance'
  2. Create task 'Team Standup' with description 'Daily sync' and tag 'meeting'
  3. Type 'budget' in search
  4. Verify 'Q1 Planning' is shown (matches description)
  5. Clear and type 'finance'
  6. Verify 'Q1 Planning' is shown (matches tag)
  7. Type 'meeting'
  8. Verify both tasks are shown ('meeting' in tag and description)

**Expected Results:**
  - Search queries title, description, and tag name fields
  - Multiple fields are OR-searched (any match qualifies)
  - Tag array is properly searched with .some()
  - Partial matches work correctly
  - Search performance is fast with useMemo optimization

#### 4.3. Filter by Status

**File:** `tests/filters/filter-status.spec.ts`

**Steps:**
  1. Create tasks with various statuses (2 TODO, 2 IN_PROGRESS, 2 DONE)
  2. Switch to list view
  3. Verify all 6 tasks are shown
  4. Open status filter dropdown
  5. Uncheck 'Done' status
  6. Verify only TODO and IN_PROGRESS tasks are shown (4 tasks)
  7. Verify count shows 'Showing 4 of 6 tasks'
  8. Uncheck 'To Do' status
  9. Verify only IN_PROGRESS tasks are shown (2 tasks)
  10. Re-check all statuses
  11. Verify all 6 tasks return

**Expected Results:**
  - Status filter uses multi-select checkboxes
  - Default state includes all statuses
  - Filter applies in real-time
  - statusFilter state is array of TaskStatus values
  - Tasks are filtered with .filter(task => statusFilter.includes(task.status))
  - Filter persists until manually changed
  - Works in combination with search

#### 4.4. Filter by Priority

**File:** `tests/filters/filter-priority.spec.ts`

**Steps:**
  1. Create tasks with priorities: LOW, MEDIUM, HIGH, URGENT (1 of each)
  2. Verify all 4 tasks displayed
  3. Open priority filter
  4. Select only 'HIGH' and 'URGENT'
  5. Verify only 2 tasks with HIGH/URGENT priority show
  6. Select only 'LOW'
  7. Verify only LOW priority task shows
  8. Clear priority filter (select all)
  9. Verify all 4 tasks return

**Expected Results:**
  - Priority filter is multi-select
  - Priority badges help visual identification
  - Filter state is array of Priority enum values
  - Filtering logic: priorityFilter.includes(task.priority)
  - Priority colors: LOW (gray), MEDIUM (blue), HIGH (orange), URGENT (red)
  - Combined with status filter for powerful queries

#### 4.5. Sort Tasks

**File:** `tests/filters/sort-tasks.spec.ts`

**Steps:**
  1. Create tasks with various dates and priorities
  2. Select 'Newest' sort option
  3. Verify tasks ordered by creation date (newest first)
  4. Select 'Oldest' sort
  5. Verify tasks ordered by creation date (oldest first)
  6. Select 'Priority' sort
  7. Verify order: URGENT > HIGH > MEDIUM > LOW
  8. Select 'Due Date' sort
  9. Verify tasks with due dates come first, sorted by date
  10. Verify tasks without due dates appear at end
  11. Select 'Title' sort
  12. Verify alphabetical order

**Expected Results:**
  - Sort dropdown with 5 options: newest, oldest, priority, dueDate, title
  - Sorting uses Array.sort() with custom comparators
  - Priority sort uses priorityOrder mapping (URGENT: 0, HIGH: 1, etc.)
  - Due date sort handles null values correctly
  - Title sort uses localeCompare for proper alphabetical order
  - Sorting only applies in list view, not board view
  - Sort state persists across filter changes

#### 4.6. Combined Filters

**File:** `tests/filters/combined-filters.spec.ts`

**Steps:**
  1. Create diverse set of 10 tasks with various attributes
  2. Apply status filter: only TODO
  3. Apply priority filter: HIGH and URGENT
  4. Type 'report' in search
  5. Verify only tasks matching ALL criteria are shown
  6. Click 'Clear filters' button
  7. Verify all tasks return and all filters reset
  8. Apply filters again
  9. Switch to board view
  10. Verify search and priority filters still apply (status filter doesn't)
  11. Verify column counts reflect filtered data

**Expected Results:**
  - Filters apply cumulatively (AND logic)
  - Filter chain: search → status → priority → sort
  - useMemo dependency array includes all filter states
  - Board view respects search and priority but not status filter
  - Clear filters button resets all to default state
  - 'No matching tasks' empty state shows when no results
  - Filter performance remains fast with many tasks

### 5. Analytics Dashboard

**Seed:** `seed.spec.ts`

#### 5.1. View Analytics Overview

**File:** `tests/analytics/overview.spec.ts`

**Steps:**
  1. Login with test account
  2. Create 5 tasks: 2 TODO, 2 IN_PROGRESS, 1 DONE
  3. Navigate to /analytics page
  4. Verify page header 'Analytics' with gradient styling
  5. Verify StatsOverview cards display:
  6. - Total Tasks count
  7. - Completion Rate percentage
  8. - Tasks Completed Today
  9. - Current Streak days
  10. - Longest Streak days
  11. Verify stats reflect actual task data

**Expected Results:**
  - Analytics page renders without errors
  - getAnalyticsData Server Action fetches all required data
  - StatsOverview component displays 5 metric cards
  - Completion rate calculates correctly (completed/total * 100)
  - Streak data calculates from activityHeatmap
  - Cards show gradient accents matching app theme
  - Loading skeleton shows during data fetch

#### 5.2. Completion Chart Over Time

**File:** `tests/analytics/completion-chart.spec.ts`

**Steps:**
  1. Navigate to /analytics with existing tasks
  2. Locate CompletionChart component (left side of grid)
  3. Verify chart has tabs: 'Daily', 'Weekly', 'Monthly'
  4. Select 'Daily' tab
  5. Verify line chart shows last 7 days of completion data
  6. Select 'Weekly' tab
  7. Verify chart shows last 4 weeks
  8. Select 'Monthly' tab
  9. Verify chart shows last 6 months
  10. Hover over data points
  11. Verify tooltip shows date and completion count

**Expected Results:**
  - CompletionChart uses Recharts library
  - Chart receives daily, weekly, monthly data props
  - Tab state controls which dataset is displayed
  - Line chart has gradient fill (violet to cyan)
  - X-axis shows time labels (formatted with date-fns)
  - Y-axis shows task count
  - Responsive design works on mobile
  - Smooth animations on tab change

#### 5.3. Priority Distribution Chart

**File:** `tests/analytics/priority-chart.spec.ts`

**Steps:**
  1. Create tasks with varied priorities
  2. Navigate to /analytics
  3. Locate PriorityChart component (right side of grid)
  4. Verify pie chart shows priority distribution
  5. Verify chart legend shows: LOW, MEDIUM, HIGH, URGENT
  6. Verify colors match priority badge colors
  7. Verify percentages add up to 100%
  8. Switch to 'Status' tab
  9. Verify pie chart shows status distribution (TODO/IN_PROGRESS/DONE)
  10. Hover over pie segments
  11. Verify tooltip shows count and percentage

**Expected Results:**
  - PieChart component from Recharts displays data correctly
  - Priority data groups tasks by priority field
  - Status data groups by status field
  - Colors are consistent with app theme
  - Empty states handled if no tasks exist
  - Legend is interactive (click to toggle segments)
  - Responsive sizing on different screens

#### 5.4. Activity Heatmap

**File:** `tests/analytics/activity-heatmap.spec.ts`

**Steps:**
  1. Navigate to /analytics
  2. Scroll to ActivityHeatmap section
  3. Verify heatmap displays last 90 days in calendar format
  4. Verify each day cell shows task completion intensity
  5. Verify color intensity increases with more completions (gradient from light to dark)
  6. Verify current streak number displays
  7. Verify longest streak number displays
  8. Hover over heatmap cells
  9. Verify tooltip shows date and completion count
  10. Verify today's date is highlighted differently

**Expected Results:**
  - ActivityHeatmap calculates completions per day from task data
  - Heatmap uses CSS grid for calendar layout
  - Color intensity maps to completion count (0-5+)
  - Streak calculation finds consecutive days with completions
  - Heatmap is similar to GitHub contribution graph
  - Month labels display correctly
  - Works with sparse data (many zero days)

#### 5.5. Analytics Data Accuracy

**File:** `tests/analytics/data-accuracy.spec.ts`

**Steps:**
  1. Clear all existing tasks
  2. Create 3 tasks with priority HIGH
  3. Complete 1 task today
  4. Navigate to /analytics
  5. Verify Total Tasks = 3
  6. Verify Completion Rate = 33%
  7. Verify Tasks Completed Today = 1
  8. Verify Priority chart shows 100% HIGH
  9. Verify Status chart shows 33% DONE, 67% TODO
  10. Go back and create 2 more tasks (MEDIUM priority)
  11. Navigate to /analytics again
  12. Verify Total Tasks = 5
  13. Verify Priority chart updates to 60% HIGH, 40% MEDIUM

**Expected Results:**
  - Analytics calculations are accurate
  - Data refreshes on navigation (Server Component)
  - Prisma aggregations in getAnalyticsData are correct
  - Percentages calculate correctly with floating point
  - Real-time updates when returning to analytics page
  - No caching issues with stale data

### 6. Notifications & Settings

**Seed:** `seed.spec.ts`

#### 6.1. View Notifications

**File:** `tests/notifications/view-notifications.spec.ts`

**Steps:**
  1. Login with test account
  2. Navigate to /tasks
  3. Click notification bell icon in header
  4. Verify notification center popover opens
  5. Verify 'No notifications' message if empty
  6. Create task with due date tomorrow
  7. Wait for notification to be generated (may need cron job)
  8. Refresh and click bell again
  9. Verify notification appears in list
  10. Verify notification shows title and message
  11. Verify unread badge count on bell icon

**Expected Results:**
  - NotificationBell component shows unread count badge
  - NotificationCenter displays list of notifications
  - Notifications fetched from Notification model
  - Due date reminders created by background job or server action
  - Notifications display with icon based on type
  - Timestamp shows relative time (e.g., '2 hours ago')
  - Bell icon highlights when unread notifications exist

#### 6.2. Mark Notification as Read

**File:** `tests/notifications/mark-read.spec.ts`

**Steps:**
  1. Ensure unread notifications exist
  2. Open notification center
  3. Click on an unread notification
  4. Verify notification isRead flag updates to true
  5. Verify visual styling changes (read notifications dimmed)
  6. Verify unread count badge decrements
  7. Close notification center
  8. Verify badge shows correct count
  9. Click 'Mark all as read' button
  10. Verify all notifications marked read
  11. Verify badge disappears

**Expected Results:**
  - markNotificationAsRead Server Action updates database
  - Optimistic update provides instant visual feedback
  - Read notifications styled differently (opacity reduced)
  - Badge count accurately reflects unread count
  - Mark all as read works correctly
  - Database updates persist

#### 6.3. Notification Settings

**File:** `tests/notifications/settings.spec.ts`

**Steps:**
  1. Navigate to /settings page
  2. Scroll to Notifications section
  3. Verify NotificationSettings component displays
  4. Verify toggles for:
  5. - In-app notifications
  6. - Due date reminders
  7. - Daily digest
  8. Toggle 'Due date reminders' off
  9. Verify success toast 'Settings updated'
  10. Refresh page
  11. Verify setting persists
  12. Change 'Reminder days before' to 2 days
  13. Verify setting saves
  14. Toggle 'Daily digest' on
  15. Verify time picker appears for digest time

**Expected Results:**
  - NotificationPreference model stores user settings
  - getNotificationPreferences fetches current settings
  - updateNotificationPreferences saves changes
  - Toggles use Radix UI Switch component
  - Settings persist in database per user
  - Validation ensures reminderDaysBefore is positive integer
  - digestTime validation accepts HH:mm format
  - UI is intuitive and responsive

### 7. UI & UX Features

**Seed:** `seed.spec.ts`

#### 7.1. Dark Mode Toggle

**File:** `tests/ui/dark-mode.spec.ts`

**Steps:**
  1. Login and navigate to /tasks
  2. Verify current theme (light or dark)
  3. Click theme toggle button in header
  4. Verify theme switches to opposite mode
  5. Verify all UI elements update colors appropriately
  6. Verify gradient accents remain visible
  7. Verify task cards maintain readability
  8. Toggle back to original theme
  9. Verify smooth transition animation
  10. Refresh page
  11. Verify theme preference persists

**Expected Results:**
  - next-themes provider manages theme state
  - Theme toggle has sun/moon icon based on current theme
  - Tailwind dark: variants apply correctly
  - Theme stored in localStorage
  - No flash of wrong theme on page load
  - Gradient backgrounds work in both themes
  - Text contrast meets WCMA standards
  - Smooth CSS transitions on theme change

#### 7.2. Sidebar Collapse

**File:** `tests/ui/sidebar-collapse.spec.ts`

**Steps:**
  1. Login and navigate to /tasks
  2. Verify sidebar is expanded (240px width)
  3. Verify sidebar shows 'Taskmaster' logo and full nav labels
  4. Click collapse button (chevron icon)
  5. Verify sidebar animates to collapsed state (72px)
  6. Verify logo text hides
  7. Verify nav labels hide
  8. Verify icons remain visible
  9. Hover over nav icons
  10. Verify tooltips show full labels
  11. Click expand button
  12. Verify sidebar expands back to full width

**Expected Results:**
  - useSidebar hook manages collapse state
  - Framer Motion animates width transition (300ms)
  - AnimatePresence handles label fade out/in
  - Collapse state persists in localStorage
  - Tooltip component shows on icon hover when collapsed
  - Collapse button icon rotates 180deg
  - No layout shift in main content area
  - Mobile view hides sidebar by default

#### 7.3. Mobile Navigation

**File:** `tests/ui/mobile-nav.spec.ts`

**Steps:**
  1. Set viewport to mobile size (375x667)
  2. Login and navigate to /tasks
  3. Verify sidebar is hidden on mobile
  4. Verify hamburger menu button appears in header
  5. Click hamburger menu
  6. Verify mobile navigation sheet opens from left
  7. Verify nav items display in sheet
  8. Click 'Analytics' link
  9. Verify navigation to /analytics
  10. Verify sheet closes automatically
  11. Open menu again
  12. Click outside sheet
  13. Verify sheet closes

**Expected Results:**
  - MobileNav component uses Radix UI Sheet
  - Sheet slides in from left with animation
  - Navigation links work correctly
  - Sheet has backdrop overlay
  - Clicking outside closes sheet
  - Escape key closes sheet
  - Mobile breakpoint is 768px (md: in Tailwind)
  - Header layout adjusts for mobile

#### 7.4. Command Menu (Cmd+K)

**File:** `tests/ui/command-menu.spec.ts`

**Steps:**
  1. Login and navigate to /tasks
  2. Press 'Cmd+K' (Mac) or 'Ctrl+K' (Windows)
  3. Verify command menu modal opens
  4. Verify search input is focused
  5. Type 'task'
  6. Verify 'Create Task' action appears
  7. Press Enter to select
  8. Verify task form opens
  9. Open command menu again
  10. Type 'analytics'
  11. Verify 'Go to Analytics' appears
  12. Select it
  13. Verify navigation to /analytics
  14. Open menu and press Escape
  15. Verify menu closes

**Expected Results:**
  - CommandMenu component uses cmdk library
  - Global keyboard shortcut triggers menu
  - Fuzzy search works on commands
  - Commands include: navigation, create task, toggle theme
  - Arrow keys navigate results
  - Enter executes selected command
  - Escape closes menu
  - Recent searches show at top

#### 7.5. Confetti Animation on Task Complete

**File:** `tests/ui/confetti-animation.spec.ts`

**Steps:**
  1. Login and create task
  2. Complete task by clicking checkbox
  3. Verify confetti animation plays from center of screen
  4. Verify confetti particles fall with physics
  5. Verify animation completes after 3 seconds
  6. Verify no confetti when unchecking task
  7. Complete another task
  8. Verify confetti plays again (not cached)
  9. Complete task from detail modal
  10. Verify confetti also plays from modal

**Expected Results:**
  - canvas-confetti library creates particle effect
  - celebrateTaskComplete function triggers animation
  - Confetti colors match app theme (violet, cyan, fuchsia)
  - Animation is performant (no lag)
  - Confetti only plays on completion, not un-completion
  - Multiple completions trigger multiple animations
  - Works from both list card and detail modal
  - No console errors

#### 7.6. Page Transitions

**File:** `tests/ui/page-transitions.spec.ts`

**Steps:**
  1. Navigate to /tasks
  2. Click sidebar link to /analytics
  3. Verify smooth fade transition between pages
  4. Navigate to /settings
  5. Verify transition plays again
  6. Use browser back button
  7. Verify transition works with browser navigation
  8. Click logo to return to /tasks
  9. Verify transition is consistent

**Expected Results:**
  - PageTransition component wraps page content
  - Framer Motion handles enter/exit animations
  - Fade duration is 200-300ms
  - No layout shift during transition
  - Works with Next.js App Router navigation
  - Scroll position resets on navigation
  - Transitions are disabled for initial page load

#### 7.7. Optimistic UI Updates

**File:** `tests/ui/optimistic-updates.spec.ts`

**Steps:**
  1. Login and create task
  2. Throttle network to Slow 3G in dev tools
  3. Click task checkbox to complete
  4. Verify task updates IMMEDIATELY (no spinner)
  5. Verify strikethrough applies instantly
  6. Verify status changes instantly
  7. Wait for server response
  8. Verify no visual change (already updated)
  9. Simulate network error (disconnect)
  10. Try to delete a task
  11. Verify optimistic delete
  12. Verify rollback when error toast appears

**Expected Results:**
  - useOptimistic hook provides optimistic state
  - UI updates before Server Action completes
  - addOptimisticTask updates local state immediately
  - Server Action runs in background (startTransition)
  - On success, optimistic state syncs with server
  - On error, state rolls back and shows error toast
  - No loading spinners for instant actions
  - Network latency is hidden from user

### 8. Data Integrity & Edge Cases

**Seed:** `seed.spec.ts`

#### 8.1. Concurrent Task Updates

**File:** `tests/edge-cases/concurrent-updates.spec.ts`

**Steps:**
  1. Open app in two browser windows (different sessions/users)
  2. Create task in Window 1
  3. Edit same task in Window 2
  4. Complete task in Window 1
  5. Save edit in Window 2
  6. Verify last-write-wins (Window 2's edit persists)
  7. Verify no data corruption
  8. Verify both windows eventually sync to same state

**Expected Results:**
  - Prisma handles concurrent writes with transactions
  - No race conditions in Server Actions
  - updatedAt timestamp tracks last modification
  - Consider implementing optimistic locking if needed
  - Revalidation ensures eventual consistency
  - No 500 errors or database locks

#### 8.2. Form Validation Edge Cases

**File:** `tests/edge-cases/form-validation.spec.ts`

**Steps:**
  1. Open task creation form
  2. Try to submit empty form
  3. Verify 'Title is required' error
  4. Enter title with 1000+ characters
  5. Verify validation error or truncation
  6. Enter XSS payload in title: '<script>alert(1)</script>'
  7. Submit and verify script is escaped/sanitized
  8. Enter SQL injection attempt in description
  9. Verify Prisma parameterized queries prevent injection
  10. Enter emoji in title: '🎉 Party Task'
  11. Verify emojis save and display correctly

**Expected Results:**
  - Zod schemas validate all inputs (lib/validations/task.ts)
  - Required fields enforce presence
  - Max length validations prevent DB errors
  - React Hook Form shows validation errors
  - Server-side validation matches client-side
  - XSS is prevented by React auto-escaping
  - SQL injection impossible with Prisma
  - Unicode characters (emoji) supported

#### 8.3. Pagination and Performance

**File:** `tests/edge-cases/large-dataset.spec.ts`

**Steps:**
  1. Create 100+ tasks programmatically
  2. Navigate to /tasks
  3. Verify page loads without lag
  4. Measure time to render task list
  5. Verify no memory leaks in dev tools
  6. Switch to board view
  7. Verify drag-drop still performant
  8. Filter tasks to 10 results
  9. Verify filtering is fast (<100ms)
  10. Open and close 20 task detail modals rapidly
  11. Verify no performance degradation

**Expected Results:**
  - Client-side rendering handles 100+ tasks efficiently
  - useMemo optimizations prevent unnecessary re-renders
  - Virtualization may be needed for 1000+ tasks
  - Prisma queries use indexes (@@index directives)
  - No N+1 query problems (use include for relations)
  - Browser performance profiling shows no bottlenecks
  - Consider implementing pagination if >500 tasks

#### 8.4. Database Cascade Deletes

**File:** `tests/edge-cases/cascade-deletes.spec.ts`

**Steps:**
  1. Create task with 5 subtasks and 3 tags
  2. Note subtask IDs and tag associations
  3. Delete the parent task
  4. Query database directly to verify:
  5. - Subtasks are deleted (CASCADE)
  6. - Task-Tag associations removed
  7. - Tags themselves remain (only association deleted)
  8. Create another task with same tags
  9. Verify tags are reused (not duplicated)

**Expected Results:**
  - Prisma schema uses onDelete: Cascade for subtasks
  - Many-to-many tag relationships handled correctly
  - Tags persist for reuse across tasks
  - No orphaned records in database
  - Foreign key constraints enforced
  - Database integrity maintained after deletes

#### 8.5. Authentication Edge Cases

**File:** `tests/edge-cases/auth-edge-cases.spec.ts`

**Steps:**
  1. Login with test account
  2. Open /tasks in new tab
  3. Logout in first tab
  4. Try to interact with tasks in second tab
  5. Verify redirect to login when session expires
  6. Login with OAuth provider
  7. Manually delete session cookie
  8. Refresh page
  9. Verify redirect to login
  10. Login with same account twice (two devices)
  11. Verify both sessions work independently

**Expected Results:**
  - Session middleware checks auth on every request
  - Expired/invalid sessions redirect to login
  - No sensitive data exposed after logout
  - JWT strategy handles multiple concurrent sessions
  - Auth state syncs across tabs (storage events)
  - No security vulnerabilities

#### 8.6. Browser Compatibility

**File:** `tests/edge-cases/browser-compatibility.spec.ts`

**Steps:**
  1. Test app in Chrome (latest)
  2. Test in Firefox (latest)
  3. Test in Safari (latest)
  4. Test in Edge (latest)
  5. Verify all features work in each browser:
  6. - Authentication
  7. - Task CRUD
  8. - Drag and drop
  9. - Date picker
  10. - Animations
  11. Check for console errors in each browser
  12. Verify localStorage and cookies work

**Expected Results:**
  - App works in all modern browsers (ES2020+ support)
  - Framer Motion animations work cross-browser
  - dnd-kit drag-drop works on all pointer devices
  - Date-fns handles timezones correctly
  - CSS features have fallbacks (backdrop-blur, etc.)
  - No browser-specific bugs
  - Graceful degradation for older browsers

#### 8.7. Accessibility (A11y)

**File:** `tests/edge-cases/accessibility.spec.ts`

**Steps:**
  1. Run axe-core accessibility scanner on all pages
  2. Verify no violations
  3. Navigate entire app using only keyboard (Tab, Enter, Escape)
  4. Verify all interactive elements are reachable
  5. Test with screen reader (VoiceOver/NVDA)
  6. Verify all content is announced correctly
  7. Verify ARIA labels on buttons and forms
  8. Check color contrast ratios (WCAG AA)
  9. Verify focus indicators are visible
  10. Test with 200% zoom
  11. Verify layout doesn't break

**Expected Results:**
  - Radix UI components have built-in ARIA support
  - All interactive elements have proper labels
  - Keyboard navigation works completely
  - Focus management is logical (no traps)
  - Color contrast meets WCAG AA standards
  - Screen readers announce all important info
  - Semantic HTML used throughout
  - No accessibility violations in automated tests
