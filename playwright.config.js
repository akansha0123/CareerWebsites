// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */

const config = ({
  testDir: './tests',
 // retries : 1,
  //workers: 5, // Increase number of concurrent workers
  //fullyParallel: true, // Enable full parallelization
  timeout: 60000,  // Increase test timeout to 1 minute
   expect : { // for assertion validation by default expect timeout gives 30 seconds if we want to overide it then need to write this line of code
    timeout : 60000, // 60 seconds
  },
  //reporter: 'html',
 reporter: [
    ['line'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      categories: [
        {
          name: 'Test Defects',
          messageRegex: '.*',
          matchedStatuses: ['failed']
        }
      ],
      reportName: 'Career Websites Test Report',
      environmentInfo: {
        Browser: 'Chromium',
        Environment: 'Test',
        Framework: 'Playwright'
      },
      allureConfig: './allure-config.json'  // Path relative to allure-results
    }]
  ],
  attachments: {
        "image/*": "image"  // This ensures images are properly embedded
      },
  use:{
    browserName : 'chromium', // default browser
  //browserName : 'webkit',
    headless: true, // run tests in headless mode
    screenshot : 'only-on-failure', // take screenshot
    trace : 'retain-on-failure', // collect trace on failure
    video : 'retain-on-failure',
    launchOptions: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    }
  }
});

module.exports = config;

//   /* Configure projects for major browsers */
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },

//     {
//       name: 'firefox',
//       use: { ...devices['Desktop Firefox'] },
//     },

//     {
//       name: 'webkit',
//       use: { ...devices['Desktop Safari'] },
//     },

//     /* Test against mobile viewports. */
//     // {
//     //   name: 'Mobile Chrome',
//     //   use: { ...devices['Pixel 5'] },
//     // },
//     // {
//     //   name: 'Mobile Safari',
//     //   use: { ...devices['iPhone 12'] },
//     // },

//     /* Test against branded browsers. */
//     // {
//     //   name: 'Microsoft Edge',
//     //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
//     // },
//     // {
//     //   name: 'Google Chrome',
//     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//     // },
//   ],

//   /* Run your local dev server before starting the tests */
//   // webServer: {
//   //   command: 'npm run start',
//   //   url: 'http://localhost:3000',
//   //   reuseExistingServer: !process.env.CI,
//   // },
// });

