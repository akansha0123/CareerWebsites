
const { highlightBrokenLinks } = require('../helperclass/CommonFeatures.js');

class HomePage {
constructor(page, selectors) {
    this.page = page;
    this.cookieAcceptbutton = page.locator(selectors.cookieAcceptbutton);
    this.searchKeyword = page.locator(selectors.searchKeyword);
    this.searchLocation = page.locator(selectors.searchLocation);
    this.searchButton  =  page.locator(selectors.searchButton);
    this.sitemap  = page.locator(selectors.siteMap);
}

    async navigateCareerSite(websiteURL){
    await this.page.goto(websiteURL);
}
    async cookieAccept()
    {
        await this.cookieAcceptbutton.click();
    }

    async validSearch(searchkeyword, searchlocation) {
        await this.searchKeyword.fill(searchkeyword);
        await this.searchLocation.fill(searchlocation);
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

   
}

module.exports = {HomePage};