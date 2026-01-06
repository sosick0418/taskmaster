import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Auth tests need sequential execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 6, // 6 parallel workers for groups
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // GROUP A: Auth (sequential)
    {
      name: 'auth',
      testMatch: /tests\/auth\/.*.spec.ts/,
      fullyParallel: false,
    },

    // GROUP B: Task CRUD (sequential)
    {
      name: 'tasks',
      testMatch: /tests\/tasks\/.*.spec.ts/,
      fullyParallel: false,
      dependencies: ['auth'],
    },

    // GROUP C: Kanban (sequential)
    {
      name: 'kanban',
      testMatch: /tests\/kanban\/.*.spec.ts/,
      fullyParallel: false,
      dependencies: ['auth'],
    },

    // GROUP D: Filters (parallel)
    {
      name: 'filters',
      testMatch: /tests\/filters\/.*.spec.ts/,
      fullyParallel: true,
      dependencies: ['auth'],
    },

    // GROUP E: Analytics (parallel)
    {
      name: 'analytics',
      testMatch: /tests\/analytics\/.*.spec.ts/,
      fullyParallel: true,
      dependencies: ['auth'],
    },

    // GROUP F: UI (parallel)
    {
      name: 'ui',
      testMatch: /tests\/ui\/.*.spec.ts/,
      fullyParallel: true,
      dependencies: ['auth'],
    },

    // GROUP G: Edge Cases (sequential for safety)
    {
      name: 'edge-cases',
      testMatch: /tests\/edge-cases\/.*.spec.ts/,
      fullyParallel: false,
      dependencies: ['auth'],
    },

    // Notifications
    {
      name: 'notifications',
      testMatch: /tests\/notifications\/.*.spec.ts/,
      fullyParallel: false,
      dependencies: ['auth'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
