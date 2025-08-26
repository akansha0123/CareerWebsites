const {test, expect}= require('@playwright/test');
const {HomePage} = require('../pageObjects/HomePage.js');
const { validateFavicon, getMetaTitleAndDescription } = require('../helperclass/CommonFeatures.js');
//JSON->String-> Javascript object

const data = JSON.parse(JSON.stringify(require("../utility/siteTestDataG4S.json")));
// convert JSON to javascript object

//test.describe.configure({mode:'parallel'});
//test.describe.configure({mode:'serial'});
//for (const data of dataset) {

  
  // //Validate Career site is launched
  // test.only(`Launch Career site ${data.websiteURL}`, async ({ page }) => {
  //   const homePage = new HomePage(page, data.selectors);
  //   await homePage.navigateCareerSite(data.websiteURL);
  //   await homePage.cookieAccept();
  //   // await homePage.validSearch(data.searchkeyword, data.searchlocation);
  //   expect(await page.url()).toContain(data.websiteURL);
  // });

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


//   //Validate user can fill search form by providing valid input 
//     test(` Validate user fill Search form from homepage for valid input ${data.websiteURL}`, async ({ page }) => {
//     const homePage = new HomePage(page, data.selectors);
//     await homePage.navigateCareerSite(data.websiteURL);
//     await homePage.cookieAccept();
//     // await expect(data.searchkeyword).toBeVisible();
//     // await expect(data.searchlocation).toBeVisible();
//     // Submit the search form
    
//       await Promise.all([
//       page.waitForURL(data.searchJOB),
//       await homePage.validSearch(data.searchkeyword, data.searchlocation)
//     // page.locator('button:has-text("Search")').click()
//     ]);

//    // Validate URL contains expected path or query
//     await expect(page).toHaveURL(new RegExp('search-jobs'));
//  });



//}