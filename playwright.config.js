// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */

const config = ({
  testDir: './tests',
 // retries : 1,
   timeout: 25 *1000, // for entire project, each component can have its own timeout
    expect : { // for assertion validation by default expect timeout gives 30 seconds if we want to overide it then need to write this line of code
    timeout : 20000,
  },
  //reporter: 'html',
   reporter: [['line'], ['allure-playwright']],
  use:{
    browserName : 'chromium', // default browser
  //browserName : 'webkit',
    headless: false, // run tests in headless mode
    screenshot : 'only-on-failure', // take screenshot 
    trace : 'retain-on-failure', // collect trace on failure
    video : 'retain-on-failure'
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
  },
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

