import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'msedge',
    headless: true,
  },
  projects: [
    {
      name: 'Mobile 360px',
      use: {
        viewport: { width: 360, height: 740 },
        isMobile: true,
      },
    },
    {
      name: 'Mobile 390px',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
    {
      name: 'Mobile 430px',
      use: {
        viewport: { width: 430, height: 932 },
        isMobile: true,
      },
    },
  ],
});
