const {test, expect, selectors}= require('@playwright/test');
const {HomePage} = require('../pageObjects/HomePage.js');
const { validateFavicon, getMetaTitleAndDescription, highlightBrokenImages } = require('../helperclass/CommonFeatures.js');
const { Console } = require('console');
//JSON->String-> Javascript object

//const data= JSON.parse(JSON.stringify(require("../utility/siteTestDataCoop.json")));
const data= JSON.parse(JSON.stringify(require("../utility/siteTestDataG4S.json")));
// convert JSON to javascript object : JSON.parse() to convert into Javascript object

//test.describe.configure({mode:'parallel'});
//test.describe.configure({mode:'serial'});
//for (const data of dataset) {

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
    const msg = `Meta Title :  ${title}\nMeta Description : ${description}`;
    console.log(msg);
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

      // Fail the test with a clear message
      throw new Error(`Broken links found on ${data.websiteURL}:\n${brokenLinks.map(item => item.url + ' [Status code: ' + item.status + ']').join('\n')}`);
    } else {
      msg = `No broken links found on ${data.websiteURL}`;
      console.log(msg);
      // if (testInfo && testInfo.attach) {
      //   await testInfo.attach('Broken Links', { body: msg, contentType: 'text/plain' });
      //}
    }
  });

  //Validate Sitemap Link is present in footer and its layout
  test(`Validate Sitemap page is present on footer`, async({page}, testInfo)=>
    {
      const homePage = new HomePage(page, data.selectors);
      await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    //Scroll to the footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrolslHeight));
    const LinkText = await homePage.getText(data.selectors.siteMap);
    console.log(`Text present on browser : ` + LinkText);
    expect (LinkText).toContain(data.sitemapText);
   //Click the "Sitemap" link
    await homePage.clickLink(data.selectors.siteMap);
     await page.waitForLoadState('networkidle');
     const expSitemapHref = await homePage.getLinkHref(data.selectors.siteMap);
     console.log(`Sitemap href :` + expSitemapHref);
     //Verify the URL of the Sitemap page is valid
     expect (expSitemapHref).toContain("/sitemap");
  }
);
 // Validate Saved Jobs functionality works as expected
  test(`Validate Saved Jobs functionality works as expected on ${data.searchJOB}`, async ({ page }, testInfo) => {
    const homePage = new HomePage(page, data.selectors);
      await homePage.navigateCareerSite(data.searchJOB);
    await homePage.cookieAccept();
    //await page.goto(data.searchJOB);

await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // ex
   // await page.waitForLoadState('domcontentloaded');

    // Verify job listings and Save Job buttons
  const jobList = await page.locator(data.selectors.jobListing).first().waitFor({ state: 'visible', timeout: 15000 });

const buttons = page.locator(data.selectors.saveJobButton);
console.log('Total save buttons:', await buttons.count());
page.pause();
  const saveJobBtn = await page.locator(data.selectors.saveJobButton).first();
  await saveJobBtn.waitFor({ state: 'visible', timeout: 15000 });

  await saveJobBtn.scrollIntoViewIfNeeded();
  await expect(saveJobBtn).toBeVisible();
  // Save the first job
  await saveJobBtn.click();



  //await saveJobButton.first().click();
    //await homePage.clickLink(data.selectors.saveJob);

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