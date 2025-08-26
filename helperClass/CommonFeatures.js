/**
 * Identifies and highlights broken images on the current page.
 * Highlights broken images with a red border and returns their src and status.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array<{src: string, status: string}>>} - Array of broken image info
 */
async function highlightBrokenImages(page) {
	// Get all image srcs
	const images = await page.$$eval('img', imgs => imgs.map(img => img.src));
	const brokenImages = [];
	await Promise.all(images.map(async (src) => {
		// Ignore empty src
		if (!src) return;
		let status = null;
		try {
			const response = await page.request.get(src, { timeout: 5000 });
			status = response.status();
			if (!response.ok()) {
				brokenImages.push({ src, status });
				// Highlight the broken image on the page
				await page.evaluate((imgSrc) => {
					const imgs = Array.from(document.querySelectorAll('img'));
					imgs.forEach(img => {
						if (img.src === imgSrc) {
							img.style.border = '2px solid red';
						}
					});
				}, src);
			}
		} catch (e) {
			status = 'NO RESPONSE';
			brokenImages.push({ src, status });
			await page.evaluate((imgSrc) => {
				const imgs = Array.from(document.querySelectorAll('img'));
				imgs.forEach(img => {
					if (img.src === imgSrc) {
						img.style.border = '2px solid red';
					}
				});
			}, src);
		}
	}));
	//Check for placeholder or broken image icons (alt text or src includes 'not found', 'placeholder', etc.)
	const placeholderImages = await page.$$eval('img', imgs => imgs.filter(img => {
		const alt = (img.alt || '').toLowerCase();
		const src = (img.src || '').toLowerCase();
		return alt.includes('not found') || alt.includes('broken') || alt.includes('placeholder') || src.includes('notfound') || src.includes('placeholder') || src.includes('broken');
	}).map(img => img.src));
	for (const src of placeholderImages) {
		if (src && !brokenImages.find(b => b.src === src)) {
			brokenImages.push({ src, status: 'PLACEHOLDER/ICON' });
			await page.evaluate((imgSrc) => {
				const imgs = Array.from(document.querySelectorAll('img'));
				imgs.forEach(img => {
					if (img.src === imgSrc) {
						img.style.border = '2px solid orange';
					}
				});
			}, src);
	}
}
	return brokenImages;
}

/**
 * Validates if a favicon is present on the current page.
 * Throws an error if favicon is missing.
 * @param {import('@playwright/test').Page} page - Playwright page object
 */

async function validateFavicon(page) {
    const favicon = await page.$("link[rel='shortcut icon']");
   if (!favicon) {
		throw new Error('Favicon is missing on the page');
	}
}

/**
 * Identifies and highlights broken links on the current page.
 * Highlights broken links with a red border.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string[]>} - Array of broken link URLs
 */
async function highlightBrokenLinks(page) {
	// Get all anchor elements with href
	const links = await page.$$eval('a[href]', els => els.map(el => el.href));
	//console.log('total links : +' + {links} +':\n');

console.log(`total links found: ${links.length}\n${links.map((link, idx) => `${idx + 1}. ${link}`).join('\n')}`);
const brokenLinks = [];
	// Use Promise.all to parallelize requests for performance
	await Promise.all(links.map(async (link) => {
		// Ignore javascript:void(0) and mailto links
		if (/^javascript:|^mailto:/i.test(link)) return;
		let status = null;
		try {
			const response = await page.request.get(link, { timeout: 5000 });
			status = response.status();
			if (!response.ok()) {
				brokenLinks.push({ url: link, status });
				// Highlight the broken link on the page
				await page.evaluate((url) => {
					const anchors = Array.from(document.querySelectorAll('a[href]'));
					anchors.forEach(a => {
						if (a.href === url) {
							a.style.border = '2px solid red';
						}
					});
				}, link);
			}
		} catch (e) {
			status = 'NO RESPONSE';
			brokenLinks.push({ url: link, status });
			await page.evaluate((url) => {
				const anchors = Array.from(document.querySelectorAll('a[href]'));
				anchors.forEach(a => {
					if (a.href === url) {
						a.style.border = '2px solid red';
					}
				});
			}, link);
		}
	}));
	return brokenLinks;
}




/**
 * Returns the meta title and meta description of the current page.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<{title: string, description: string}>}
 */
async function getMetaTitleAndDescription(page) {
	const title = await page.title();
	const description = await page.$eval('head > meta[name="description"]', el => el.content).catch(() => '');
	return { title, description };
}

//  // Function to get href from a locator
//   async function gethrefValue(selectors) {
//    // const href = await locator.getAttribute('href');

// 	const hrefValue = selectors.getAttribute('href');
//     console.log('Link href:', hrefValue);
//     return hrefValue;
//   }


// module.exports = {validateText};
// module.exports = { validateFavicon, highlightBrokenLinks };
// module.exports = {getMetaTitleAndDescription};
// module.exports.getMetaTitleAndDescription = getMetaTitleAndDescription;

module.exports = {
    validateFavicon,
    highlightBrokenLinks,
    highlightBrokenImages,
    getMetaTitleAndDescription,
};