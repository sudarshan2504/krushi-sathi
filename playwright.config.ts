import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    headless: true,
    actionTimeout: 12000,
    navigationTimeout: 20000,
  },
  projects: [
    {
      name: 'Mobile 390px',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Mobile 360px',
      testMatch: /bottom-nav\.spec\.ts/,
      use: {
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Mobile 430px',
      testMatch: /bottom-nav\.spec\.ts/,
      use: {
        viewport: { width: 430, height: 932 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: 'node scripts/start-e2e-server.mjs',
      url: 'http://127.0.0.1:5010/api/health',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'npm --workspace=client run dev -- --port 5174 --host 127.0.0.1 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        VITE_API_PROXY_TARGET: 'http://127.0.0.1:5010',
      },
    },
  ],
});
