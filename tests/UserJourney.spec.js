const {test, expect}= require('@playwright/test');
const {HomePage} = require('../pageObjects/HomePage.js');
require('../helperClass/CommonFeatures.js');
//JSON->String-> Javascript object

const data = JSON.parse(JSON.stringify(require("../utility/siteTestDataG4S.json")));
//const data= JSON.parse(JSON.stringify(require("../utility/siteTestDataCoop.json")));
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
 //Ensure user receive valid error message while providing invalid inputs on location field i.e numbers, special char, incorrect loc

 test(` Validate user received error message for providing invalid inputs: like numbers, special char, incorrect location ${data.websiteURL}`, async ({ page }) => {
    for (const single of data.inValidsearch)
  {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    await homePage.invalidSearch(single.inValidSearch);
     const errorText = await page.locator(data.selectors.errorLoc).textContent();
     console.log(`For entered location :  ${single.inValidSearch} + Message received : ` + errorText);
    //console.log(`Jobs found for keyword: ${single.searchkeyword}`);
   // console.log(`Valid search keywords : ` + data.searchkeyword + `, `, data.searchlocation );
   // const url = await page.url();
    //console.log(`User landed on `+ url);
    await expect(page.locator(data.selectors.errorLoc)).toContainText(data.locerrorMsg);

  }
 });
//Ensure user can fill search form and lands to Search result page for specified job category and location
 // test(` Validate user can fill search form and lands to search result page for entered job category and location ${data.websiteURL}`, async ({ page }) => {

 //Validate user can fill search form by providing valid inputs
    test(` Validate User can fill search form on homepage by providing valid input  ${data.websiteURL}`, async ({ page }) => {
    for (const single of data.validSearch)
  {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    //await page.pause();
     await homePage.validSearch(single.searchkeyword, single.searchlocation, single.expectedLocation);

     // Wait for either search results or no-results message
      const resultsLocator = page.locator(data.selectors.searchresultHeader);
      const noResultsLocator = page.locator(data.selectors.noResultLocator);
      //await page.pause();
        await Promise.race([
        resultsLocator.waitFor({ state: 'visible', timeout: 10000 }),
        noResultsLocator.waitFor({ state: 'visible', timeout: 10000 }),
      ]);

    // Wait for search results to appear
    //await page.locator(data.selectors.searchresultHeader).waitFor({ state: 'visible', timeout: 10000 });

    const url = await page.url();
    console.log(`User searched for keywords : ${single.searchkeyword}, ${single.expectedLocation} and landed on \n ${url}`);
    // const header = await page.locator(data.selectors.searchresultHeader).textContent();
    // console.log(header);

     // Validate URL contains expected path or query
    await expect(page).toHaveURL(new RegExp('search-jobs'));



    // await expect(page.locator(data.selectors.searchresultHeader)).toContainText(single.searchkeyword);
  }
 });

 //   //Validate user can  provid valid input and lands to search result page for search keywords
    test(` Verify user provide valid input and lands to Search result page with specific job category and location.${data.websiteURL}`, async ({ page }) => {
      for (const single of data.validSearch)
  {
    try{
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.websiteURL);
    await homePage.cookieAccept();
    await homePage.validSearch(single.searchkeyword, single.searchlocation, single.expectedLocation);
    console.log(`Valid search keywords : ` + single.searchkeyword + `, `, single.expectedLocation );

    const resultsLocator = page.locator(data.selectors.searchresultHeader);
    const noResultsLocator = page.locator(data.selectors.noResultLocator);
    const noResultsMessageLocator = page.locator(data.selectors.noresultsMessage);
        await Promise.race([
        resultsLocator.waitFor({ state: 'visible', timeout: 10000 }),
        noResultsLocator.waitFor({ state: 'visible', timeout: 10000 }),
      ]);

      const url = await page.url();
      console.log(`User landed on `+ url);
      if (await resultsLocator.isVisible()) {
      // Search results are visible → perform match/assert
      await expect(resultsLocator).toContainText(single.searchkeyword);
      console.log(`Jobs found for keywords : ${single.searchkeyword}, ${single.expectedLocation}`);
      const header = await resultsLocator.textContent();
     // Validate URL contains expected path or query
      await expect(page).toHaveURL(/\/search-jobs/);
      console.log(`Search Results : ` + header);
      } else if (await noResultsLocator.isVisible()) {
      // No search results → get message from page
      const message = await noResultsLocator.textContent();
      await expect(page).toHaveURL(/\/search-jobs/);
      console.log(`No jobs found for keywords:  ${single.searchkeyword} , ${single.expectedLocation}: ${message}`);
      } else {
      // Neither locator is visible → unexpected case
      await expect(page).toHaveURL(/\/search-jobs/);
      console.log('Neither search results nor "no results" message appeared.');
      }
    //throw new Error('Search results page did not load correctly.');
     // Check URL, but don’t stop loop on failure
    if (!url.includes("/search-jobs")) {
      console.error(`❌ FAIL: User did not land on /search-jobs for keyword ${single.searchkeyword}, location ${single.expectedLocation}`);
    }
    }
   catch (err) {
    console.error(`Iteration failed for keyword: ${single.searchkeyword}, location: ${single.expectedLocation}`);
    console.error(err);
  }
  }
 });

//Verify user can save multiple jobs on SR page and revisit them on Saved job page
 test(`Validate user can save multiple jobs on SR page and revisit them on Saved job page ${data.searchJOB}`, async ({ page }, testInfo) => {
    const homePage = new HomePage(page, data.selectors);
    await homePage.navigateCareerSite(data.searchJOB);
    await homePage.cookieAccept();

    // Verify job listings and Save Job buttons
    await page.locator(data.selectors.jobListing).first().waitFor({ state: 'visible', timeout: 15000 });
    const firstJob = await page.locator(data.selectors.jobListing).first();
    await firstJob.click();
    await page.goBack();
    const saveJobBtn = await page.locator(data.selectors.saveJobButton).first();
    //await saveJobBtn.waitFor({ state: 'visible', timeout: 15000 });

    await saveJobBtn.scrollIntoViewIfNeeded();
    await expect(saveJobBtn).toBeVisible();
    console.log(await firstJob.textContent());
    // Save the first job
    await saveJobBtn.click();

    await page.locator(data.selectors.saveJobButton).nth(1).scrollIntoViewIfNeeded();
    await page.locator(data.selectors.saveJobButton).nth(1).click();

    //Verify that the job is saved
    await expect(page.locator(data.selectors.savedJobButton).nth(1)).toBeVisible();


    // Refresh the page and verify the job is still saved
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(data.selectors.savedJobButton).nth(1)).toBeVisible();

    // Navigate to the saved jobs page and verify the job is listed
    await homePage.clickLink(data.selectors.savedJobLink);
    await page.waitForLoadState('networkidle');
    await expect(page.locator(data.selectors.jobListing).first()).toBeVisible();
    const firstsavedJobTitle = await page.locator(data.selectors.jobListing).first().textContent();
    const firstJobTitle =  firstsavedJobTitle.replace(/\s+/g, '').trim();
   // await page.pause();
    const secsavedJobTitle = await page.locator(data.selectors.jobListing).nth(1).textContent();
    const secondJobTitle = secsavedJobTitle.replace(/\s+/g, '').trim();
    console.log(`First Saved job title on Saved Job Page : ` + await firstJobTitle);
     expect(await firstsavedJobTitle).toContain(await firstJob.textContent());
    console.log(`Second Saved job title on Saved Job Page : ` + await secondJobTitle);
    expect(await secsavedJobTitle).toContain(await page.locator(data.selectors.jobListing).nth(1).textContent());

  });


