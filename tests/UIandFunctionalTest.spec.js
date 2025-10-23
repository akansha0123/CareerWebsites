const {test, expect, selectors}= require('@playwright/test');
const {HomePage} = require('../pageObjects/HomePage.js');
const { validateFavicon, getMetaTitleAndDescription, highlightBrokenImages, highlightBrokenLinks } = require('../helperClass/CommonFeatures.js');
const { Console } = require('console');
const { url } = require('inspector');

//Need to convert JSON->String-> Javascript object


//const data = JSON.parse(JSON.stringify(require("../utility/siteTestDataG4S.json")));
const data= JSON.parse(JSON.stringify(require("../utility/siteTestDataPrimark.json")));
//const data= JSON.parse(JSON.stringify(require("../utility/siteTestDataCCEP.json")));
// convert JSON to javascript object : JSON.parse() to convert into Javascript object

//test.describe.configure({mode:'parallel'});
//test.describe.configure({mode:'serial'});
//for (const data of dataset) {

  // Validate favicon presence
    test.describe.only('Smoke Tests', () => {
    let homePage;

     for (const siteData of data.urls) {
    test.describe(`Testing ${siteData.name}`, () => {

  //test.describe('Smoke Tests', () => {
 // Run before all tests in this describe block
    // test.beforeEach(async ({ page }) => {

    test.beforeEach(async ({ page }) => {
                try {
                    // Initialize HomePage and navigate
                    homePage = new HomePage(page, data.selectors);

                    console.log(`Setting up test for: ${siteData.url}`);
                    await page.goto(siteData.url, {
                        waitUntil: 'networkidle',
                        timeout: 30000
                    });

                    // Accept cookies
                    await homePage.cookieAccept()
                        .catch(() => console.log('No cookie banner found'));

                    // Ensure page is ready
                    await page.waitForLoadState('domcontentloaded');
                } catch (error) {
                    console.error(`Test setup failed for ${siteData.url}:`, error);
                    throw error;
                }
            });

  test(`Validate favicon on @smoke ${siteData.url}`, async ({ page }, testInfo) => {
   // const homePage = new HomePage(page, data.selectors);

    try {
        // Navigate and setup
       //  await page.goto(siteData.url);
       // await homePage.cookieAccept().catch(() => console.log('No cookie banner found'));

        // Validate favicon
        const favicon = await homePage.validatePageFavicon();

        // Attach results to test report
        await testInfo.attach('Favicon Report', {
            body: JSON.stringify({
                url: siteData.url,
                faviconUrl: favicon.url,
                contentType: favicon.contentType
            }, null, 2),
            contentType: 'application/json'
        });

        // Attach actual favicon image
        await testInfo.attach('Favicon Image', {
            body: favicon.buffer,
            contentType: favicon.contentType
        });

        console.log(`✅ Valid favicon found on ${siteData.url}`);

    } catch (error) {
        console.error(`Favicon validation failed for ${siteData.url}:`, error);
        await testInfo.attach('Error Screenshot', {
            body: await page.screenshot(),
            contentType: 'image/png'
        });
        throw error;
    }
});

 // Validate Meta data - title and description
// test(`Validate meta title and description on @smoke ${data.websiteURL}`, async ({ page }, testInfo) => {

  test(`Validate meta title and description on @smoke ${siteData.url}`, async ({ page }, testInfo) => {

    const { title, description } = await getMetaTitleAndDescription(page);

    const msg = `Testing ${siteData.name}\nMeta Title :  ${title}\nMeta Description : ${description}`;
    console.log(msg);
     await testInfo.attach('Meta Data', { body: msg, contentType: 'text/plain' });

     // expect(title, `Meta title should not be empty for ${data.websiteURL}`).not.toBe('');
     expect(title, `Meta title should not be empty for ${siteData.url}`).not.toBe('');

      // expect(description, `Meta description should not be empty for ${data.websiteURL}`).not.toBe('');
     expect(description, `Meta description should not be empty for ${siteData.url}`).not.toBe('');

      });

  // Validate and highlight broken links
 // test.describe('Smoke Tests', () => {
  //test(`Check and highlight broken links on @smoke ${data.websiteURL}`, async ({ page }, testInfo) => {
  test(`Check and highlight broken links on @smoke ${siteData.url}`, async ({ page }, testInfo) => {
    // const homePage = new HomePage(page, data.selectors);
    // await homePage.navigateCareerSite(data.websiteURL);
    // await homePage.cookieAccept();
    // const brokenLinks = await homePage.checkAndHighlightBrokenLinks();
    // let msg = '';
    // page.pause();
    // if (brokenLinks.length > 0) {
    //   // Print a detailed report for each broken link with status code

    //    const report = [`Broken links found on ${data.websiteURL}:`].concat(
    //     brokenLinks.map((item, idx) => `${idx + 1}. ${item.url} [Status: ${item.status}]`)
    //   ).join('\n');
    //   msg = report;

    //   // Fail the test with a clear message
    //   throw new Error(`Broken links found on ${data.websiteURL}:\n${brokenLinks.map(item => item.url + ' [Status code: ' + item.status + ']').join('\n')}`);
    // } else {
    //   msg = `No broken links found on ${data.websiteURL}`;
    //   console.log(msg);
    //   // if (testInfo && testInfo.attach) {
    //   //   await testInfo.attach('Broken Links', { body: msg, contentType: 'text/plain' });
    //   //}
    // }
   // const homePage = new HomePage(page, data.selectors);

// LATEST WORKING CODE - 09OCt

  //   const failedUrls = []; // Initialize the array to store failed URLs
  //     try {
  //       // Navigate to the URL first
  //       console.log(`Navigating to: ${siteData.url}`);
  //       await page.goto(siteData.url, {
  //           waitUntil: 'networkidle',
  //           timeout: 30000
  //       });

  //       // Check for broken links
  //       const brokenLinks = await homePage.checkAndHighlightBrokenLinks();

  //       // Process results for each URL
  //       if (brokenLinks.length > 0) {
  //           const report = [
  //               `\nBroken links found on ${siteData.url}:`,
  //               ...brokenLinks.map((item, idx) =>
  //                   `${idx + 1}. ${item.url} [Status: ${item.status}]`
  //               )
  //           ].join('\n');

  //           console.log(report);

  //           // Attach results to test report
  //           if (testInfo && testInfo.attach) {
  //               await testInfo.attach(`Broken Links - ${siteData.url}`, {
  //                   body: report,
  //                   contentType: 'text/plain'
  //               });
  //           }

  //           // Store failed URLs for final report
  //           failedUrls.push({url: siteData.url, brokenLinks});
  //       } else {
  //           console.log(`✅ No broken links found on ${siteData.url}`);
  //       }

  //       // Optional: Add a small delay between checks
  //       await page.waitForTimeout(1000);
  //  // }

  //   // Fail test if any broken links were found
  //   if (failedUrls.length > 0) {
  //       const finalReport = failedUrls
  //           .map(({url, brokenLinks}) =>
  //               `\nBroken links on ${url}:\n${brokenLinks
  //                   .map(link => `- ${link.url} [Status: ${link.status}]`)
  //                   .join('\n')}`
  //           )
  //           .join('\n');

  //       throw new Error(`Found broken links on ${failedUrls.length} pages:\n${finalReport}`);
  //   }
  // }
  // catch (error) {
  //       console.error(`Failed to check links on ${siteData.url}:`, error);
  //       // Take screenshot on failure
  //       await testInfo.attach('Failed State', {
  //           body: await page.screenshot(),
  //           contentType: 'image/png'
  //       });
  //       throw error;
  //   }

   try {
        // Get link analysis report
        const linkReport = await homePage.analyzeSiteLinks();

         // Create detailed report in sections
        const report = {
            summary: linkReport.summary,
            internalLinks: linkReport.internalLinksList.map(link => ({
                url: link.url,
                status: link.status,
                section: link.section,
                text: link.text || 'No text content'
            })),
            externalLinks: linkReport.externalLinksList.map(link => ({
                url: link.url,
                status: link.status,
                section: link.section,
                text: link.text || 'No text content'
            })),
            brokenLinks: linkReport.brokenLinks.map(link => ({
                url: link.url,
                status: link.status,
                statusText: link.statusText,
                section: link.section,
                text: link.text || 'No text content'
            }))
        };

        // Attach report to test results
        await testInfo.attach('Link Analysis Report', {
            body: JSON.stringify(report, null, 2),
            contentType: 'application/json'
        });
       // Attach readable summary
       const summaryReport = [
            `\nLink Analysis for ${siteData.url}`,
            `Total Links: ${report.summary.totalLinks}`,
            `Internal Links: ${report.summary.internalLinks}`,
            `External Links: ${report.summary.externalLinks}`,
            `Broken Links: ${report.summary.brokenLinks}`,
            `Critical Errors: ${report.summary.criticalErrors}`,
            '\nBreakdown by Section:',
            ...Object.entries(linkReport.sectionBreakdown)
                .map(([section, count]) => `${section}: ${count} links`)
        ].join('\n');

        await testInfo.attach('Link Analysis Summary', {
            body: summaryReport,
            contentType: 'text/plain'
        });

        // Take screenshot if broken links found
        if (linkReport.hasBrokenLinks) {
            await testInfo.attach('Broken Links Screenshot', {
                body: await page.screenshot({ fullPage: true }),
                contentType: 'image/png'
            });
            throw new Error(linkReport.errorSummary);
        }

        console.log(`✅ All ${report.summary.totalLinks} links are valid on ${siteData.url}`);
    } catch (error) {
        console.error(`Link check failed for ${siteData.url}:`, error);
        throw error;
    }
  })
//});

 //Validate and highlight broken images
  test(`Check and highlight broken images on @smoke ${data.websiteURL}`, async ({ page }, testInfo) => {

    // const homePage = new HomePage(page, data.selectors);
    // await homePage.navigateCareerSite(data.websiteURL);

      await page.goto(siteData.url);
      await page.waitForLoadState('domcontentloaded');
     // Initialize array to store pages with broken images
      const failedImageUrls = [];
      // Check for broken images
      const brokenImages = await homePage.checkAndHighlightBrokenImages(page);

      // Process results for each URL
      if (brokenImages.length > 0) {
        const report = [
          `\nBroken images found on ${siteData.url}:`,
          ...brokenImages.map((item, idx) =>
            `${idx + 1}. ${item.src} [Status: ${item.status}]`
          )
        ].join('\n');

        console.error(`\n\x1b[31m${report}\x1b[0m`);

        // Attach results to test report
        if (testInfo && testInfo.attach) {
          await testInfo.attach(`Broken Images - ${siteData.url}`, {
            body: report,
            contentType: 'text/plain'
          });
        }

        // Store failed URLs for final report
        failedImageUrls.push({ url: siteData.url, brokenImages });
      } else {
        console.log(`✅ No broken images found on ${siteData.url}`);
      }

      // Optional: Add a small delay between checks
      await page.waitForTimeout(1000);
    //}

    // Fail test if any broken images were found
    if (failedImageUrls.length > 0) {
      const finalReport = failedImageUrls
        .map(({ url, brokenImages }) =>
          `\nBroken images on ${url}:\n${brokenImages
            .map(image => `- ${image.src} [Status: ${image.status}]`)
            .join('\n')}`
        )
        .join('\n');

      throw new Error(`Found broken images on ${failedImageUrls.length} pages:\n${finalReport}`);
    }
  });

   // Validate no placeholder or dummy text "lorem ipsum", "dummy text", is present on website
  //  test(`Check for placeholder content on ${data.websiteURL}`, async ({ page }, testInfo) => {
  test(`Check for placeholder content on ${siteData.url}`, async ({ page }, testInfo) => {

      const homePage = new HomePage(page, data.selectors);
     await homePage.cookieAccept().catch(() => console.log('No cookie banner found'));

     //  await homePage.navigateCareerSite(siteData.url);
        // const urlsToCheck = [
        //     data.websiteURL,
        //     data.searchJOB,
        //     data.sitemap
        // ];
        const pagesWithPlaceholders = [];// Initialize array to store pages with placeholder content

        // for (const url of urlsToCheck) {
        //     console.log(`\nChecking for placeholder content on: ${url}`);

        //     await homePage.navigateCareerSite(url);
        //     await homePage.cookieAccept();
        //     await page.waitForLoadState('domcontentloaded');
        await page.goto(siteData.url);
           await page.waitForLoadState('domcontentloaded');

            const placeholderContent = await homePage.checkForPlaceholderContent();

            if (placeholderContent.length > 0) {
                const report = [
                    `\nPlaceholder content found on ${siteData.url}:`,
                    ...placeholderContent.map((item, idx) =>
                        `${idx + 1}. [${item.type}] "${item.text}"\n` +
                        `   Location: ${item.location}\n` +
                        `   Context: "...${item.context}..."`
                    )
                ].join('\n');

                console.error(`\n\x1b[31m${report}\x1b[0m`);

                // Take screenshot of the page with highlighted content
                await testInfo.attach(`Placeholder Content - ${siteData.url}`, {
                    body: await page.screenshot(),
                    contentType: 'image/png'
                });

                // Attach detailed report
                await testInfo.attach(`Placeholder Report - ${siteData.url}`, {
                    body: report,
                    contentType: 'text/plain'
                });

                pagesWithPlaceholders.push({ url: siteData.url, placeholderContent });
            } else {
                console.log(`✅ No placeholder content found on ${siteData.url}`);
            }

            await page.waitForTimeout(1000);
       // }

        if (pagesWithPlaceholders.length > 0) {
            const finalReport = pagesWithPlaceholders
                .map(({ url, placeholderContent }) =>
                    `\nPlaceholder content on ${url}:\n${placeholderContent
                        .map(item =>
                            `- [${item.type}] "${item.text}" found in ${item.location}\n` +
                            `  Context: "...${item.context}..."`
                        )
                        .join('\n')}`
                )
                .join('\n');

            throw new Error(`Found placeholder content on ${pagesWithPlaceholders.length} pages:\n${finalReport}`);
        }
      });
  //  });


//    test(`Test video playback on @smoke ${siteData.url}`, async ({ page }, testInfo) => {
//     try {
//         console.log(`\nChecking video playback on: ${siteData.url}`);
//          // Ensure page is ready
//         await page.waitForLoadState('domcontentloaded');
//         await page.waitForLoadState('networkidle');


//         const results = await homePage.checkVideoPlayback();

//          if (!results.videosFound) {
//             // Take screenshot for verification
//             await testInfo.attach('Page Screenshot', {
//                 body: await page.screenshot({ fullPage: true }),
//                 contentType: 'image/png'
//             });
//             console.log(`ℹ️ No videos found on ${siteData.url}`);
//             return;
//         }

//         // Create detailed report
//         const report = {
//             url: siteData.url,
//             totalVideos: results.details.length,
//             successfulTests: results.details.filter(d => d.status === 'success').length,
//             failedTests: results.details.filter(d => d.status === 'failed').length,
//             details: results.details,
//             errors: results.errors
//         };

//         // Attach report to test results
//         await testInfo.attach('Video Playback Report', {
//             body: JSON.stringify(report, null, 2),
//             contentType: 'application/json'
//         });

//         // Take screenshot for evidence
//         await testInfo.attach('Video State Screenshot', {
//             body: await page.screenshot({ fullPage: true }),
//             contentType: 'image/png'
//         });

//         // Fail test if any video tests failed
//         if (results.errors.length > 0) {
//             throw new Error(`Video playback issues found:\n${results.errors.join('\n')}`);
//         }

//         console.log(`✅ All ${report.totalVideos} videos tested successfully on ${siteData.url}`);

//     }  catch (error) {
//         console.error(`❌ Video test failed on ${siteData.url}:`, error.message);
//         await testInfo.attach('Failed State', {
//             body: await page.screenshot({ fullPage: true }),
//             contentType: 'image/png'
//         });
//         throw error;
//     }
// });

});

     }
    });

// validate if video can be played
// ...existing code...

// test.describe.only('Smoke Tests', () => {

// });
// function formatVideoReport(results, url) {
//     return [
//         `\nVideo playback results for ${url}:`,
//         ...results.map(result =>
//             `\nVideo Type: ${result.selector}` +
//             `\nVideos Found: ${result.count}` +
//             `\nTest Results:\n${result.details
//                 .map(detail => `  - ${detail.action}: ${detail.status}` +
//                     (detail.details ? `\n    ${JSON.stringify(detail.details, null, 2)}` : ''))
//                 .join('\n')}`
//         )
//     ].join('\n');
// }

//Validate Sitemap Link is present in footer and its layout
  test(`Validate Sitemap page is present on footer on ${data.websiteURL}`, async({page}, testInfo)=>
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


    //Verify that the job is saved
    await expect(page.locator(data.selectors.savedJobButton).first()).toBeVisible();


    // Refresh the page and verify the job is still saved
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(data.selectors.savedJobButton).first()).toBeVisible();

    // Navigate to the saved jobs page and verify the job is listed
    await homePage.clickLink(data.selectors.savedJobLink);
    //page.pause();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(data.selectors.jobListing).first()).toBeVisible();
    const savedJobTitle = page.locator(data.selectors.jobListing).first().textContent();
    console.log(`Saved job title on Saved Job Page : ` + await savedJobTitle);
     expect(await savedJobTitle).toContain(await firstJob.textContent());
  });
