
const { highlightBrokenLinks } = require('../helperclass/CommonFeatures.js');

class HomePage {
constructor(page, selectors) {
    this.page = page;
    this.cookieAcceptbutton = page.locator(selectors.cookieAcceptbutton);
    this.searchKeyword = page.locator(selectors.searchKeyword);
    this.searchLocation = page.locator(selectors.searchLocation);
    this.searchButton  =  page.locator(selectors.searchButton);
    this.locDropdown = page.locator(selectors.locDropdown);
    this.errorLoc = page.locator(selectors.errorLoc);
    this.sitemap  = page.locator(selectors.siteMap);
    this.searchHeader = page.locator(selectors.searchresultHeader);
    this.saveJOB = page.locator(selectors.saveJob);
}

    async navigateCareerSite(websiteURL){
    await this.page.goto(websiteURL);
}
    async cookieAccept()
    {

        //await this.cookieAcceptbutton.click();
       if (await this.cookieAcceptbutton.isVisible()) {
            await this.cookieAcceptbutton.click();
            console.log("Cookie banner accepted ✅");
        } else {
           // console.log("Cookie banner not found, continuing...");
        }
    }

    async validSearch(searchkeyword, searchlocation, expectedLocation) {
        await this.searchKeyword.fill(searchkeyword);
        // clear the search field first
        await this.searchLocation.click({ clickCount: 3 }); // Select all text
        await this.searchLocation.press('Backspace');      // Delete selected text

        await this.searchLocation.pressSequentially(searchlocation);
        // wait for dropdown to appear
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
    /**
     * Checks and highlights broken links on the current page.
     * @returns {Promise<string[]>} Array of broken link URLs
     */
    async checkAndHighlightBrokenLinks() {
        return await highlightBrokenLinks(this.page);
    }

     /**
     * Checks and highlights broken links on the current page.
     * @returns {Promise<string[]>} Array of broken link URLs
     */
      async checkAndHighlightBrokenLinks() {
        return await highlightBrokenLinks(this.page);
    }

    async checkAndHighlightBrokenImages() {
        return await highlightBrokenLinks(this.page);
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