
const {
    highlightBrokenLinks,
    highlightBrokenImages,
    getSameDomainLinks,
    detectPlaceholderContent,
    validateFavicon,
    analyzeSiteLinks,
    testVideoPlayback
} = require('../helperClass/CommonFeatures.js');

class HomePage {
constructor(page, selectors) {
    this.page = page;
    this.selectors = selectors;
    this.cookieAcceptbutton = page.locator(selectors.cookieAcceptbutton);
    this.searchKeyword = page.locator(selectors.searchKeyword);
    this.searchLocation = page.locator(selectors.searchLocation);
    this.searchButton  =  page.locator(selectors.searchButton);
    this.locDropdown = page.locator(selectors.locDropdown);
    this.errorLoc = page.locator(selectors.errorLoc);
    this.sitemap  = page.locator(selectors.siteMap);
    this.searchHeader = page.locator(selectors.searchresultHeader);
    this.saveJOB = page.locator(selectors.saveJob);
    this.sitemapLink = page.locator(selectors.sitemapLink);

}

    async navigateCareerSite(websiteURL){
    await this.page.goto(websiteURL);
}

//  async navigateCareerSite(websiteURL) {
//         try {
//             // Add navigation timeout and wait until networkidle
//             await this.page.goto(websiteURL, {
//                 timeout: 30000,
//                 waitUntil: 'networkidle'
//             });
//         } catch (error) {
//             console.error(`Navigation failed to ${websiteURL}: ${error.message}`);
//             throw new Error(`Failed to navigate to ${websiteURL}: ${error.message}`);
//         }
//     }

    async cookieAccept()
    {

        //await this.cookieAcceptbutton.click();
    //    if (await this.cookieAcceptbutton.isVisible()) {
    //         await this.cookieAcceptbutton.click();
    //         console.log("Cookie banner accepted ✅");
    //     } else {
    //        // console.log("Cookie banner not found, continuing...");
    //     }
       try {
        // Try each cookie button selector individually
        for (const selector of this.selectors.cookieAcceptbutton) {
            try {
                const button = this.page.locator(selector);
                const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);

                if (isVisible) {
                    await button.click();
                    console.log(`✅ Cookie banner accepted using: ${selector}`);
                    return;
                }
            } catch (err) {
                // Continue to next selector if current one fails
                continue;
            }
        }
        console.log("ℹ️ No cookie banner found");
    } catch (error) {
        console.log("ℹ️ Cookie banner handling failed:", error.message);
    }
 }

    async validSearch(searchkeyword, searchlocation, expectedLocation) {
        await this.searchKeyword.fill(searchkeyword);
        // clear the search field first
        await this.searchLocation.click({ clickCount: 3 }); // Select all text
        await this.searchLocation.press('Backspace');      // Delete selected text

        await this.searchLocation.pressSequentially(searchlocation);
        // wait for dropdown to appear
        //this.page.pause();
        const dropdownOptions = this.locDropdown;
        await dropdownOptions.waitFor();

        const options =  await dropdownOptions.locator("li").count();
       for (let i=0; i< options; i++)
       {
         const   text = await  dropdownOptions.locator("li").nth(i).textContent();
          if (text && text.trim() === expectedLocation)
           // if (text === "United Kingdom" || text === "India" || text === "Singapore")
            //if(text.includes("India"))
            {
            await  dropdownOptions.locator("li").nth(i).click();
            break;
            }
       } //  await this.page.pause();
     await this.searchButton.click();
    }

     async invalidSearch(inValidSearch)
     {
         await this.searchLocation.click({ clickCount: 3 }); // Select all text
         await this.searchLocation.press('Backspace');
         await this.searchLocation.pressSequentially(inValidSearch);
         await this.searchButton.click();
     }



    async validatePageFavicon() {
        const result = await validateFavicon(this.page);
        return result;
    }

    /**
     * Checks and highlights broken links on the current page.
     * @returns {Promise<string[]>} Array of broken link URLs
     */
    async checkAndHighlightBrokenLinks() {
      // Wait for all initial network requests to complete
         await this.page.waitForLoadState('networkidle');
        return await highlightBrokenLinks(this.page);
    }
/**
     * Gets all links from the current page grouped by section
     * @returns {Promise<Array<{url: string, section: string, text: string}>>}
     */
    async getAllPageLinks() {
    try {
        const baseDomain = new URL(this.page.url()).hostname;
        const links = await getSameDomainLinks(this.page, baseDomain);
        console.log(`Found ${links.length} same-domain links`);
        return links;
    } catch (error) {
        console.error('Error getting page links:', error.message);
        return [];
    }
}

     /**
     * Checks for broken links in all sections
     * @returns {Promise<Array<{url: string, status: string, section: string, text: string}>>}
     */
//     async checkAndHighlightAllBrokenLinks() {
//         try {
//         const links = await this.getAllPageLinks();
//         const brokenLinks = [];
//         const batchSize = 5;

//         // Process links in batches
//         for (let i = 0; i < links.length; i += batchSize) {
//             const batch = links.slice(i, i + batchSize);
//             const results = await Promise.allSettled(batch.map(async (link) => {
//                 try {
//                     const response = await this.page.request.get(link.url, {
//                         timeout: 5000,
//                         failOnStatusCode: false
//                     });

//                     if (!response.ok()) {
//                         return {
//                             ...link,
//                             status: response.status()
//                         };
//                     }
//                 } catch (e) {
//                     return {
//                         ...link,
//                         status: 'NO RESPONSE'
//                     };
//                 }
//                 return null;
//             }));

//             // Process results
//             results.forEach(result => {
//                 if (result.status === 'fulfilled' && result.value) {
//                     brokenLinks.push(result.value);
//                 }
//             });
//         }

//         // Highlight broken links
//         await Promise.all(brokenLinks.map(link => this.highlightBrokenLink(link)));

//         return brokenLinks;
//     } catch (error) {
//         console.error('Error in checkAndHighlightBrokenLinks:', error.message);
//         return [];
//     }
// }


async checkSpecificLinks(links) {
    const brokenLinks = [];
    for (const link of links) {
        try {
            const response = await this.page.request.get(link.url, { timeout: 5000 });
            if (!response.ok()) {
                brokenLinks.push({
                    url: link.url,
                    status: response.status(),
                    section: link.section,
                    text: link.text
                });
            }
        } catch (error) {
            brokenLinks.push({
                url: link.url,
                status: 'NO RESPONSE',
                section: link.section,
                text: link.text
            });
        }
    }
    return brokenLinks;
}

    /**
     * Highlights a broken link on the page
     * @private
     */
    async highlightBrokenLink(link) {
        await this.page.evaluate(({url, status}) => {
            const anchors = document.querySelectorAll(`a[href="${url}"]`);
            anchors.forEach(a => {
                a.style.border = '2px solid red';
                a.style.backgroundColor = '#ffebee';
                a.title = `Broken Link (Status: ${status})`;
            });
        }, link);
    }





    //  /**
    //  * Checks and highlights broken links on the current page.
    //  * @returns {Promise<string[]>} Array of broken link URLs
    //  */
    //   async checkAndHighlightBrokenLinks() {
    //     return await highlightBrokenLinks(this.page);
    // }

    async checkAndHighlightBrokenImages() {
        return await highlightBrokenImages(this.page);
    }

 async verifySitemap() {
        try {
            // Scroll to footer
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
           // await this.page.pause();
            await this.page.waitForLoadState('networkidle');

           // await this.page.waitForTimeout(3000);

            // Find and verify sitemap link
            const sitemapLink = this.page.locator(this.sitemapLink);
           // await sitemapLink.waitFor({ state: 'visible', timeout: 5000 });
            //Get text of the link
            const linkText = await sitemapLink.textContent();

            if(linkText === this.selectors.sitemapText[0] || linkText === this.selectors.sitemapText[1])
            {
                console.log("Sitemap link text verified ✅ : " + linkText);

            }
            else
            {
                throw new Error(`Sitemap link text does not match expected values. Found: ${linkText}`);
            }

            // Get href before clicking
            const href = await sitemapLink.getAttribute('href');

            // Click the link
            await sitemapLink.click();
            await this.page.waitForLoadState('networkidle');

            // Verify we're on sitemap page
            const currentUrl = this.page.url();
            const heading = await this.page.locator(this.selectors.sitemapLink)
                .filter({ hasText: /sitemap/i })
                .first()
                .textContent();

            return {
                success: true,
                url: currentUrl,
                title: heading?.trim() || ''
            };

        } catch (error) {
            console.error('Sitemap verification failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * Checks for placeholder text and lorem ipsum content on the page
     * @returns {Promise<Array<{text: string, context: string, type: string, location: string}>>}
     */
    async checkForPlaceholderContent() {
        try {
            await this.page.waitForLoadState('domcontentloaded');
            const results = await detectPlaceholderContent(this.page);

            // Highlight found placeholder content
            if (results.length > 0) {
                await this.page.evaluate((matches) => {
                    const walk = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );

                    while (walk.nextNode()) {
                        const node = walk.currentNode;
                        matches.forEach(match => {
                            if (node.textContent.toLowerCase().includes(match.text.toLowerCase())) {
                                const span = document.createElement('span');
                                span.style.backgroundColor = match.type === 'Lorem Ipsum' ? '#ffebee' : '#fff3e0';
                                span.style.border = `2px solid ${match.type === 'Lorem Ipsum' ? 'red' : 'orange'}`;
                                span.title = `${match.type} content found`;
                                node.parentNode.replaceChild(span, node);
                                span.appendChild(node);
                            }
                        });
                    }
                }, results);
            }

            return results;
        } catch (error) {
            console.error('Error checking for placeholder content:', error);
            return [];
        }
    }


/**
 * Tests video functionality on the page
 * @returns {Promise<Array>} Test results
 */
 async checkVideoPlayback() {
        try {
             await this.page.waitForLoadState('domcontentloaded');
             await this.page.waitForLoadState('networkidle', { timeout: 30000 });

        // Check if page is still available
        if (!this.page.isClosed()) {
            const results = await testVideoPlayback(this.page);
            return {
            videosFound: Array.isArray(results.details) && results.details.length > 0,
            details: results.details || [],
            errors: Array.isArray(results.errors) ? results.errors : []
        };
        } else {
            throw new Error('Page context is no longer available');
        }
    }
        catch (error) {
        console.error('Video playback test error:', error);
        return {
            videosFound: false,
            details: [],
            errors: [error.message]
        };
    }
}
// function for formatting video test results


async analyzeSiteLinks() {
    try {
        // Get all links and their status
        const results = await highlightBrokenLinks(this.page);
         // Calculate section breakdown
         const sectionBreakdown = this.calculateSectionBreakdown([
            ...results.internalLinks,
            ...results.externalLinks
        ]);
        return {
            hasBrokenLinks: results.brokenLinks.length > 0,
            summary: {
                url: this.page.url(),
                totalLinks: results.totalLinks,
                internalLinks: results.internalLinks.length,
                externalLinks: results.externalLinks.length,
                brokenLinks: results.brokenLinks.length,
                criticalErrors: results.criticalErrors
            },
            brokenLinks: results.brokenLinks,
            internalLinksList: results.internalLinks,
            externalLinksList: results.externalLinks,
            sectionBreakdown,
            errorSummary: results.brokenLinks.length > 0
                ? `Found ${results.brokenLinks.length} broken links (${results.criticalErrors} critical errors)`
                : null
        };
    } catch (error) {
        throw new Error(`Failed to analyze links: ${error.message}`);
    }
}

calculateSectionBreakdown(links) {
    return links.reduce((acc, link) => {
        acc[link.section] = (acc[link.section] || 0) + 1;
        return acc;
    }, {});
}

    /**
     * Check for sitemap link present
     */
    async getText(selector)
    {
     return await this.page.innerText(selector);
    }

    async clickLink(selector)
    {
        await this.page.click(selector);
    }

    async getLinkHref (selector)
    {
        return await this.sitemap.getAttribute('href');
       }

}

module.exports = {HomePage};