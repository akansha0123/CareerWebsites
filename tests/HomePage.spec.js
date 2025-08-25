const {test, expect}= require('@playwright/test');
const {HomePage} = require('../pageObjects/HomePage.js');
const { validateFavicon, getMetaTitleAndDescription } = require('../helperclass/CommonFeatures.js');
//JSON->String-> Javascript object

const data = JSON.parse(JSON.stringify(require("../utility/siteTestDataCoop.json")));
// convert JSON to javascript object

//test.describe.configure({mode:'parallel'});
test.describe.configure({mode:'serial'});
//for (const data of dataset) {

  
  //Validate Career site is launched
  test(`Launch Career site ${data.websiteURL}`, async ({ page }) => {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    // await homePage.validSearch(data.searchkeyword, data.searchlocation);
    expect(await page.url()).toContain(data.websiteURL);
  });


  // Validate favicon presence
  test(`Validate favicon on ${data.websiteURL}`, async ({ page }) => {
    await page.goto(data.websiteURL);
    await page.waitForLoadState('domcontentloaded');
    await expect(async () => {
      await validateFavicon(page);
    }).not.toThrow();
    console.log(`Favicon is present on ${data.websiteURL}`);
  });

  // Validate and highlight broken links
  test(`Check and highlight broken links on ${data.websiteURL}`, async ({ page }) => {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    const brokenLinks = await homePage.checkAndHighlightBrokenLinks();
    if (brokenLinks.length > 0) {
      console.warn(`Broken links found on ${data.websiteURL}:`, brokenLinks);
    } else {
      console.log(`No broken links found on ${data.websiteURL}`);
    }
    expect(brokenLinks.length, `There should be no broken links on ${data.websiteURL}`).toBe(0);
  });

  // Validate Meta data - title and description
  test(`Validate meta title and description on ${data.websiteURL}`, async ({ page }) => {
    await page.goto(data.websiteURL);
    await page.waitForLoadState('domcontentloaded');
    const { title, description } = await getMetaTitleAndDescription(page);
    console.log(`Meta Title for ${data.websiteURL}:`, title);
    console.log(`Meta Description for ${data.websiteURL}:`, description);
    expect(title, `Meta title should not be empty for ${data.websiteURL}`).not.toBe('');
    expect(description, `Meta description should not be empty for ${data.websiteURL}`).not.toBe('');
  });
//}