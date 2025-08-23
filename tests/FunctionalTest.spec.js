const {test, expect}= require('@playwright/test');
const {HomePage} = require('../pageObjects/Homepage.js');
const { validateFavicon, getMetaTitleAndDescription, highlightBrokenImages } = require('../helperclass/CommonFeatures.js');
//JSON->String-> Javascript object

//const dataset= JSON.parse(JSON.stringify(require("../utility/siteTestDataG4S.json")));
const data= JSON.parse(JSON.stringify(require("../utility/siteTestDataG4S.json")));
// convert JSON to javascript object

//test.describe.configure({mode:'parallel'});
//test.describe.configure({mode:'serial'});
//for (const data of dataset) {

//Validate Career site is launched
  test(`Launch Career site ${data.websiteURL}`, async ({ page }, testInfo) => {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    // await homePage.validSearch(data.searchkeyword, data.searchlocation);
    const url = await page.url();
    const msg = `Launched site: ${url}`;
    console.log(msg);
    if (testInfo && testInfo.attach) {
      await testInfo.attach('Launch Site', { body: msg, contentType: 'text/plain' });
    }
    expect(url).toContain(data.websiteURL);
  });


  // Validate favicon presence
  test(`Validate favicon on ${data.websiteURL}`, async ({ page }, testInfo) => {
    await page.goto(data.websiteURL);
    await page.waitForLoadState('domcontentloaded');
    let msg = '';
    await expect(async () => {
      await validateFavicon(page);
    }).not.toThrow();
    msg = `Favicon is present on ${data.websiteURL}`;
    console.log(msg);
    if (testInfo && testInfo.attach) {
      await testInfo.attach('Favicon', { body: msg, contentType: 'text/plain' });
    }
  });

  // Validate Meta data - title and description
  test(`Validate meta title and description on ${data.websiteURL}`, async ({ page }, testInfo) => {
    await page.goto(data.websiteURL);
    await page.waitForLoadState('domcontentloaded');
    const { title, description } = await getMetaTitleAndDescription(page);
    const msg = `Meta Title for ${data.websiteURL}: ${title}\nMeta Description for ${data.websiteURL}: ${description}`;
    console.log(msg);
    if (testInfo && testInfo.attach) {
      await testInfo.attach('Meta Title & Description', { body: msg, contentType: 'text/plain' });
    }
    expect(title, `Meta title should not be empty for ${data.websiteURL}`).not.toBe('');
    expect(description, `Meta description should not be empty for ${data.websiteURL}`).not.toBe('');
  });

  // Validate and highlight broken links
  test(`Check and highlight broken links on ${data.websiteURL}`, async ({ page }, testInfo) => {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    const brokenLinks = await homePage.checkAndHighlightBrokenLinks();
    let msg = '';
    if (brokenLinks.length > 0) {
      // Print a detailed report for each broken link with status code
       const report = [`Broken links found on ${data.websiteURL}:`].concat(
        brokenLinks.map((item, idx) => `${idx + 1}. ${item.url} [Status: ${item.status}]`)
      ).join('\n');
      msg = report;
      //console.error(`\n\x1b[31m${report}\x1b[0m`);
      // Attach to Playwright HTML report
      // if (testInfo && testInfo.attach) {
      //   await testInfo.attach('Broken Links', { body: report, contentType: 'text/plain' });
      // }
      // // Attach to Allure if available
      // if (typeof allure !== 'undefined') {
      //   allure.attachment('Broken Links', report, 'text/plain');
      // }
      // Fail the test with a clear message
      throw new Error(`Broken links found on ${data.websiteURL}:\n${brokenLinks.map(item => item.url + ' [Status code: ' + item.status + ']').join('\n')}`);
    } else {
      msg = `No broken links found on ${data.websiteURL}`;
     // console.log(msg);
      // if (testInfo && testInfo.attach) {
      //   await testInfo.attach('Broken Links', { body: msg, contentType: 'text/plain' });
      //}
    }
  });

  

// Validate and highlight broken images

  // test.only(`Check and highlight broken images on ${data.websiteURL}`, async ({ page }, testInfo) => {
  //   const homePage = new HomePage(page, data.selectors);
  //   await homePage.navigateCareerSite(data.websiteURL);
  //   await homePage.cookieAccept();
  //   const brokenImages = await homePage.checkAndHighlightBrokenImages(page);
    
  //   let msg = '';
  //   if (brokenImages.length > 0) {
  //     // Print a detailed report for each broken image with status
  //     const report = [`Broken images found on ${data.websiteURL}:`].concat(
  //       brokenImages.map((item, idx) => `${idx + 1}. ${item.src} [Status: ${item.status}]`)
  //     ).join('\n');
  //     msg = report;
  //     console.error(`\n\x1b[31m${report}\x1b[0m`);
  //     // Attach to Playwright HTML report
  //     if (testInfo && testInfo.attach) {
  //       await testInfo.attach('Broken Images', { body: report, contentType: 'text/plain' });
  //     }
  //     // Attach to Allure if available
  //     if (typeof allure !== 'undefined') {
  //       allure.attachment('Broken Images', report, 'text/plain');
  //     }
  //     // Fail the test with a clear message
  //     throw new Error(`Broken images found on ${data.websiteURL}:\n${brokenImages.map(item => item.src + ' [Status: ' + item.status + ']').join('\n')}`);
  //   } else {
  //     msg = `No broken images found on ${data.websiteURL}`;
  //     console.log(msg);
  //     if (testInfo && testInfo.attach) {
  //       await testInfo.attach('Broken Images', { body: msg, contentType: 'text/plain' });
  //     }
  //   }
  // });  

//}