// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { permission } from 'process';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
  const config = ({
  testDir: './tests',
  //retries : 1, // retry the test for 2 times, 
  workers : 3, // execute all test file at same time that's called as parallel mode, by default its 5 
  timeout: 40 *1000, // for entire project, each component can have its own timeou
    expect : { // for assertion validation by default expect timeout gives 30 seconds if we want to overide it then need to write this line of code
    timeout : 20000,
  },
  //reporter: 'html',
  reporter: [['line'], ['allure-playwright']],
  projects : [
    {
    name : 'safari',
    use: {
      browserName : 'webkit', // Safari browser
      headless: false, // run tests in headless mode
      screenshot : 'only-on-failure', // take screenshot 
      trace : 'retain-on-failure', // collect trace on failure
      //viewport : {width:350,height:800}
    }
  },
   {
    name : 'safarimobile',
    use: {
      browserName : 'webkit', // Safari browser
      headless: false, // run tests in headless mode
      screenshot : 'only-on-failure', // take screenshot 
      trace : 'retain-on-failure', // collect trace on failure
     // viewport : {width:350,height:800} // manually given dimensions
     ...devices['iPhone 14 Pro Max'],
     ignoreHttpsErrors: true,
     
    }
  },
  {
 name : 'chrome',
    use: {
      browserName : 'chromium', // Chrome browser
      headless: false, // run tests in headless mode
      screenshot : 'only-on-failure', // take screenshot 
      video :'retain-on-failure',
      trace : 'on', // collect trace on failure
      permissions: ['geolocation'],
     ignoreHttpsErrors: true
    }
  }
  ]

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

