const fs = require('fs');
const path = require('path');
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
    // Get favicon URL with improved selectors
    const faviconUrl = await page.evaluate(() => {
        const selectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="apple-touch-icon"]',
            'link[rel="icon shortcut"]'
        ];
        for (const selector of selectors) {
            const favicon = document.querySelector(selector);
            if (favicon && favicon.href) return favicon.href;
        }
        return null;
    });

    if (!faviconUrl) {
        throw new Error('No favicon found on the page');
    }

    // Verify favicon can be loaded
    const response = await page.request.get(faviconUrl);
    if (!response.ok()) {
        throw new Error(`Favicon returned status ${response.status()}`);
    }

    return {
        url: faviconUrl,
        contentType: response.headers()['content-type'],
        buffer: await response.body()
    };
}

/**
 * Identifies and highlights broken links on the current page.
 * Highlights broken links with a red border.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string[]>} - Array of broken link URLs
 */
// async function highlightBrokenLinks(page) {

//  // Wait for page load
//     await page.waitForLoadState('domcontentloaded');
//     await page.waitForLoadState('networkidle');

//     // Debug page state
//     console.log('Current URL:', await page.url());
//     console.log('Page Load State:', await page.evaluate(() => document.readyState));

//     // Get all anchor elements with href using a more robust selector
//     const links = await page.evaluate(() => {
//         // Get all anchors including those in iframes
//         const anchors = [...document.querySelectorAll('a[href]')];

//         // Get anchors from iframes
//         const iframes = document.querySelectorAll('iframe');
//         iframes.forEach(iframe => {
//             try {
//                 const iframeAnchors = iframe.contentDocument.querySelectorAll('a[href]');
//                 anchors.push(...iframeAnchors);
//             } catch (e) {
//                 console.log('Could not access iframe content');
//             }
//         });

//         // Filter and normalize links
//         return anchors
//             .filter(a => {
//                 const href = a.getAttribute('href');
//                 return href &&
//                        href !== '#' &&
//                        !href.startsWith('javascript:') &&
//                        !href.startsWith('mailto:');
//             })
//             .map(a => {
//                 const href = a.getAttribute('href');
//                 // Handle relative URLs
//                 return href.startsWith('http') ? href : new URL(href, window.location.origin).href;
//             });
//     });

//     console.log(`Total links found: ${links.length}`);

//     if (links.length === 0) {
//         // Take screenshot for debugging
//         await page.screenshot({ path: 'debug-no-links.png' });

//         // Log page content sample
//         const pageContent = await page.content();
//         console.log('Page content sample:', pageContent.substring(0, 500));

//         // Check if page is in iframe
//         const frames = page.frames();
//         console.log(`Found ${frames.length} frames`);
//     }

// const brokenLinks = [];
// 	// Use Promise.all to parallelize requests for performance
// 	await Promise.all(links.map(async (link) => {
// 		// Ignore javascript:void(0) and mailto links
// 		if (/^javascript:|^mailto:/i.test(link)) return;
// 		let status = null;
// 		try {
// 			const response = await page.request.get(link, { timeout: 5000 });
// 			status = response.status();
// 			if (!response.ok) {
// 				brokenLinks.push({ url: link, status });
// 				// Highlight the broken link on the page
// 				await page.evaluate((url) => {
// 					const anchors = Array.from(document.querySelectorAll('a[href]'));
// 					anchors.forEach(a => {
// 						if (a.href === url) {
// 							a.style.border = '2px solid red';
// 						}
// 					});
// 				}, link);
// 			}
// 		} catch (e) {
// 			status = 'NO RESPONSE';
// 			brokenLinks.push({ url: link, status });
// 			await page.evaluate((url) => {
// 				const anchors = Array.from(document.querySelectorAll('a[href]'));
// 				anchors.forEach(a => {
// 					if (a.href === url) {
// 						a.style.border = '2px solid red';
// 					}
// 				});
// 			}, link);
// 		}
// 	}));
// 	return brokenLinks;
// }
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

async function getSameDomainLinks(page, baseDomain) {
    return await page.evaluate((domain) => {
        const sections = {
            'Header': 'header',
            'Navigation': 'nav',
            'Main Content': 'main',
            'Footer': 'footer',
            'Sidebar': 'aside',
            'Other': 'body'
        };

        const links = new Set();
        const linkDetails = [];

        for (const [sectionName, selector] of Object.entries(sections)) {
            const sectionElement = document.querySelector(selector);
            if (!sectionElement) continue;

            const sectionLinks = Array.from(sectionElement.querySelectorAll('a[href]'));
            sectionLinks.forEach(link => {
                try {
                    const url = new URL(link.href);
                    if (url.hostname === domain && !links.has(link.href)) {
                        links.add(link.href);
                        linkDetails.push({
                            url: link.href,
                            section: sectionName,
                            text: link.textContent.trim()
                        });
                    }
                } catch (e) {
                    if (link.href && link.href.startsWith('/')) {
                        const fullUrl = new URL(link.href, `https://${domain}`).href;
                        if (!links.has(fullUrl)) {
                            links.add(fullUrl);
                            linkDetails.push({
                                url: fullUrl,
                                section: sectionName,
                                text: link.textContent.trim()
                            });
                        }
                    }
                }
            });
        }
        return linkDetails;
    }, baseDomain);
}

/**
 * Checks for placeholder text and lorem ipsum content
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array<{text: string, context?: string, element?: string, location?: string}>>}
 */
async function detectPlaceholderContent(page) {
    const placeholderPatterns = {
        loremIpsum: [
            'lorem ipsum',
            'dolor sit amet',
            'consectetur adipiscing',
            'morbi eget porta',
            'vestibulum ante',
            'primis in faucibus',
            'orci luctus',
            'ultrices posuere',
            'cubilia curae',
            'quisque bibendum',
            'suspendisse dictum',
            'tempus varius'
        ],
        placeholders: [
            'placeholder',
            'test',
            'lorem ipsum',
             'text',
            // '[enter text here]',
            'sample text',
            'your text',
            'example text'
        ],
         // Add valid test-related job titles to exclude
        validTestTitles: [
            'test engineer',
            'senior test engineer',
            'sr. test engineer',
            'test automation engineer',
            'qa test engineer',
            'software test engineer',
            'test lead',
            'test architect',
            'test manager',
            'test analyst',
            'runmytests'
        ]
    };

    return await page.evaluate((patterns) => {
        const matches = [];

         // Helper function to check if text contains valid test titles
        const containsValidTestTitle = (text) => {
            const lowerText = text.toLowerCase();
            return patterns.validTestTitles.some(title =>
                lowerText.includes(title.toLowerCase())
            );
        };

         // Helper function to check if word is standalone
        const isStandaloneWord = (word, text) => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(text);
        };

        const processText = (text, location, element = null) => {
              // Skip processing if text contains valid test titles
            if (containsValidTestTitle(text)) {
                return;
            }

            const lowerText = text.toLowerCase();

            // Check for lorem ipsum patterns
            patterns.loremIpsum.forEach(pattern => {
                if (isStandaloneWord(pattern, text)) {
                    matches.push({
                        text: pattern,
                        type: 'Lorem Ipsum',
                        context: text.substring(
                            Math.max(0, lowerText.indexOf(pattern) - 30),
                            Math.min(text.length, lowerText.indexOf(pattern) + pattern.length + 30)
                        ).trim(),
                        location,
                        element
                    });
                }
            });

            // Check for placeholder patterns
            patterns.placeholders.forEach(pattern => {
                // Only check for standalone occurrences
                if (isStandaloneWord(pattern, text)) {
                    // Additional check for 'test' to avoid false positives
                    if (pattern.toLowerCase() === 'test') {
                        // Skip if it's part of a compound word or valid test title
                        const wordAround = text.substring(
                            Math.max(0, lowerText.indexOf('test') - 10),
                            Math.min(text.length, lowerText.indexOf('test') + 15)
                        );
                        if (containsValidTestTitle(wordAround)) {
                            return;
                        }
                    }

                    matches.push({
                        text: pattern,
                        type: 'Placeholder',
                        context: text.substring(
                            Math.max(0, lowerText.indexOf(pattern) - 30),
                            Math.min(text.length, lowerText.indexOf(pattern) + pattern.length + 30)
                        ).trim(),
                        location,
                        element
                    });
                }
            });
        };


        // Check visible text content
        document.querySelectorAll('p, div, span, h1, h2, h4, h5, h6, a').forEach(el => {
            if (el.innerText.trim()) {
                processText(el.innerText, el.tagName.toLowerCase(), 'Content');
            }
        });

        // Check form elements
        document.querySelectorAll('input, textarea').forEach(el => {
            if (el.placeholder) {
                processText(el.placeholder, 'Form Input', 'Placeholder');
            }
            if (el.value && !el.value.startsWith('{{') && !el.value.endsWith('}}')) {
                processText(el.value, 'Form Input', 'Value');
            }
        });

        return matches;
    }, placeholderPatterns);
}

/**
 * Tests video playback functionality
 * @param {import('@playwright/test').Page} page
 * @param {string} videoSelector
 * @returns {Promise<{success: boolean, details: Array<{action: string, status: string}>}>}
 */
// Add these functions before the testVideoPlayback function

async function testHTML5Video(page, element, videoResult) {
    try {
        await element.evaluate(video => {
            return new Promise((resolve, reject) => {
                // Test play
                const playPromise = video.play();
                if (playPromise) {
                    playPromise
                        .then(() => {
                            // Test pause after 1 second
                            setTimeout(() => {
                                video.pause();
                                resolve({
                                    canPlay: true,
                                    canPause: true,
                                    duration: video.duration
                                });
                            }, 1000);
                        })
                        .catch(error => reject(`Play failed: ${error.message}`));
                } else {
                    reject('Video play not supported');
                }
            });
        });
        videoResult.status = 'success';
    } catch (error) {
        videoResult.status = 'failed';
        videoResult.error = error.message;
    }
}

async function testYouTubeVideo(page, element, videoResult) {
    try {
        await element.evaluate(iframe => {
            return new Promise((resolve, reject) => {
                // Add YouTube API
                if (!window.YT) {
                    const script = document.createElement('script');
                    script.src = 'https://www.youtube.com/iframe_api';
                    document.head.appendChild(script);
                }

                // Wait for API to load
                function checkYT() {
                    if (window.YT && window.YT.Player) {
                        const player = new YT.Player(iframe, {
                            events: {
                                onReady: () => {
                                    try {
                                        player.playVideo();
                                        setTimeout(() => {
                                            player.pauseVideo();
                                            resolve({
                                                canPlay: true,
                                                canPause: true
                                            });
                                        }, 1000);
                                    } catch (e) {
                                        reject(`YouTube player error: ${e.message}`);
                                    }
                                },
                                onError: (e) => reject(`YouTube error: ${e.data}`)
                            }
                        });
                    } else {
                        setTimeout(checkYT, 100);
                    }
                }
                checkYT();
            });
        });
        videoResult.status = 'success';
    } catch (error) {
        videoResult.status = 'failed';
        videoResult.error = error.message;
    }
}

async function testVimeoVideo(page, element, videoResult) {
    try {
        await element.evaluate(iframe => {
            return new Promise((resolve, reject) => {
                // Add Vimeo API
                if (!window.Vimeo) {
                    const script = document.createElement('script');
                    script.src = 'https://player.vimeo.com/api/player.js';
                    script.onload = initPlayer;
                    document.head.appendChild(script);
                } else {
                    initPlayer();
                }

                function initPlayer() {
                    try {
                        const player = new Vimeo.Player(iframe);
                        player.play().then(() => {
                            setTimeout(() => {
                                player.pause().then(() => {
                                    resolve({
                                        canPlay: true,
                                        canPause: true
                                    });
                                });
                            }, 1000);
                        }).catch(error => reject(`Vimeo play failed: ${error.message}`));
                    } catch (error) {
                        reject(`Vimeo player error: ${error.message}`);
                    }
                }
            });
        });
        videoResult.status = 'success';
    } catch (error) {
        videoResult.status = 'failed';
        videoResult.error = error.message;
    }
}


async function testVideoPlayback(page) {
    const results = {
        videosFound: false,
        details: [],
        errors: []
    };

   try {
        // Wait for page load
        await page.waitForLoadState('domcontentloaded');
         await page.waitForTimeout(2000); // Give videos time to initialize

        // Check each video type
        const videoTypes = {
            html5: { selector: 'video', test: testHTML5Video },
            youtube: { selector: 'iframe[src*="youtube"]', test: testYouTubeVideo },
            vimeo: { selector: 'iframe[src*="vimeo"]', test: testVimeoVideo },
            brightcove: { selector: 'video-js', test: testHTML5Video }
        };

        for (const [type, config] of Object.entries(videoTypes)) {
            try {
                const elements = page.locator(config.selector);
                const count = await elements.count();

            if (count > 0) {
                results.videosFound = true;

             for (let i = 0; i < count; i++) {
                    const element = elements.nth(i);
                     const isVisible = await element.isVisible()
                            .catch(() => false);

                        if (!isVisible) continue;

                     try {
                            await element.scrollIntoViewIfNeeded();
                            await config.test(page, element, {
                                type,
                                index: i + 1,
                                status: 'checking'
                            });
                        } catch (error) {
                            results.errors.push(`${type} video ${i + 1}: ${error.message}`);
                        }
                    }
                }
            } catch (typeError) {
                console.error(`Error checking ${type} videos:`, typeError);
            }
        }
    } catch (error) {
        console.error('Video test error:', error);
        results.errors.push(`General error: ${error.message}`);
    }

    return results;
}

// this one is getting uesd for Broken Links as of Oct 2025
async function highlightBrokenLinks(page) {
    try {
         // Load configuration
        const configPath = path.join(__dirname, '../utility/siteTestDataG4S.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));


       // Get configuration values with defaults
        const clientErrors = config.errorCodes?.clientErrors || {};
        const {
            batchSize = 5,
            timeout = 10000,
            errorStyles = {
                clientError: {
                    borderColor: '#ff9800',
                    backgroundColor: '#fff3e0'
                },
                serverError: {
                    borderColor: '#f44336',
                    backgroundColor: '#ffebee'
                },
                networkError: {
                    borderColor: '#9c27b0',
                    backgroundColor: '#f3e5f5'
                }
            }
        } = config.linkValidation || {};


        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle');

           // Initialize results object
        const results = {
            totalLinks: 0,
            internalLinks: [],
            externalLinks: [],
            brokenLinks: [],
            criticalErrors: 0,
            clientErrors: [],
            serverErrors: []
        };


       // Get all links from the page
        const links = await page.evaluate(() => {
            const baseUrl = window.location.origin;
            const links = [];
            document.querySelectorAll('a[href]').forEach(a => {
                const href = a.href;
                if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                    links.push({
                        url: href,
                        text: a.textContent.trim(),
                        isInternal: href.startsWith(baseUrl) || href.startsWith('/'),
                        section: a.closest('header, nav, main, footer, aside')?.tagName.toLowerCase() || 'body',
                        visible: window.getComputedStyle(a).display !== 'none'
                    });
                }
            });
            return links;
        });

         results.totalLinks = links.length;

        // Process links in batches
        for (let i = 0; i < links.length; i += batchSize) {
            const batch = links.slice(i, i + batchSize);
            await Promise.all(batch.map(async (link) => {
                try {
                    const response = await page.request.get(link.url, {
                        timeout: 10000,
                        failOnStatusCode: false
                    });

                    const status = response.status();
                    const linkInfo = {
                        ...link,
                        status,
                        statusText: clientErrors[status] || response.statusText() || 'Unknown Error',
                         isBroken: !response.ok()
                    };

                    // Categorize the link
                    if (link.isInternal) {
                        results.internalLinks.push(linkInfo);
                    } else {
                        results.externalLinks.push(linkInfo);
                    }

                    // Check for critical errors (404, 500, etc.)
                    // if (response.status() === 404 || response.status() >= 500) {
                    //     results.criticalErrors++;
                    //     results.brokenLinks.push(linkInfo);
                    //       await highlightBrokenLinkOnPage(page, link.url);
                    // }

                     // Handle different error types
                    if (status >= 400 && status < 500) {
                        results.clientErrors.push(linkInfo);
                        await highlightBrokenLinkOnPage(page, link.url, 'clientError', errorStyles.clientError);
                         results.brokenLinks.push(linkInfo);
                        results.criticalErrors++;
                    } else if (status >= 500) {
                        results.serverErrors.push(linkInfo);
                        await highlightBrokenLinkOnPage(page, link.url, 'serverError', errorStyles.serverError);
                       results.brokenLinks.push(linkInfo);
                        results.criticalErrors++;
                    }

                } catch (error) {
                    const linkInfo = {
                        ...link,
                        status: 'ERROR',
                        statusText: error.message,
                        isBroken: true
                    };
                    results.brokenLinks.push(linkInfo);
                    results.criticalErrors++;
                    await highlightBrokenLinkOnPage(page, link.url, 'networkError', errorStyles.networkError);
                }
            }));
        }

        return results;

    } catch (error) {
          console.error('Link check error:', error);
        throw new Error(`Link check failed: ${error.message}`);
    }
}

async function highlightBrokenLinkOnPage(page, url, errorType, styles) {
    await page.evaluate((url, styles) => {
        document.querySelectorAll(`a[href="${url}"]`).forEach(a => {
             Object.assign(a.style, {
                border: '2px solid',
                borderColor: styles.borderColor,
                backgroundColor: styles.backgroundColor
            });
        });
    }, {url, styles});
}



module.exports = {
    validateFavicon,
    highlightBrokenLinks,
    highlightBrokenImages,
    getMetaTitleAndDescription,
    getSameDomainLinks,
    detectPlaceholderContent,
    testVideoPlayback,
     testHTML5Video,    // Add these
    testYouTubeVideo,  // Add these
    testVimeoVideo
};