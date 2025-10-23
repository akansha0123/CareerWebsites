const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    let browser;
    try {
        console.log('Starting PDF generation...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-web-security',
                '--allow-file-access-from-files'
            ],
            defaultViewport: { width: 1920, height: 1080 }
        });

        const page = await browser.newPage();
        page.on('console', msg => console.log('Browser console:', msg.text()));

        const reportPath = path.join(__dirname, '../allure-report/index.html');
        console.log(`Loading report from: ${reportPath}`);

        await page.goto(`file://${reportPath}`, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Expand all sections and capture data
        await page.evaluate(async () => {
            // Helper function to wait for element
            const waitForElement = (selector) => {
                return new Promise(resolve => {
                    if (document.querySelector(selector)) {
                        return resolve(document.querySelector(selector));
                    }

                    const observer = new MutationObserver(() => {
                        if (document.querySelector(selector)) {
                            observer.disconnect();
                            resolve(document.querySelector(selector));
                        }
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                });
            };

            // Expand all collapsible elements
            const expandElements = async () => {
                const expandButtons = document.querySelectorAll('.collapse-button');
                for (const button of expandButtons) {
                    button.click();
                    await new Promise(resolve => requestAnimationFrame(resolve));
                }
            };

            await waitForElement('#content');
            await expandElements();
        });

        // Define sections to capture with their specific handling
        const sections = [
            {
                name: 'Overview',
                selector: '[data-widget="summary"]',
                beforeCapture: async () => {
                    await page.evaluate(() => {
                        document.querySelectorAll('.status-details').forEach(el => el.style.display = 'block');
                    });
                }
            },
            {
                name: 'Categories',
                selector: '[data-widget="categories"]',
                beforeCapture: async () => {
                    await page.click('[data-widget="categories"] .tree__arrow');
                }
            },
            {
                name: 'Suites',
                selector: '[data-widget="suites"]',
                beforeCapture: async () => {
                    await page.evaluate(() => {
                        document.querySelectorAll('[data-widget="suites"] .tree__arrow').forEach(el => el.click());
                    });
                }
            },
            { name: 'Graph', selector: '[data-widget="graph"]' },
            { name: 'Timeline', selector: '[data-widget="timeline"]' },
            { name: 'Behaviors', selector: '[data-widget="behaviors"]' },
            { name: 'Packages', selector: '[data-widget="packages"]' }
        ];

        // Create output directory
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(__dirname, '../test-reports', timestamp);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Capture each section
        for (const section of sections) {
            try {
                console.log(`Processing section: ${section.name}`);

                // Wait for section content
                await page.waitForSelector(section.selector, { visible: true, timeout: 30000 });

                // Execute any pre-capture actions
                if (section.beforeCapture) {
                    await section.beforeCapture();
                }

                // Take section screenshot
                const element = await page.$(section.selector);
                await element.screenshot({
                    path: path.join(outputDir, `${section.name.toLowerCase()}.png`)
                });
            } catch (error) {
                console.error(`Failed to capture ${section.name}:`, error.message);
            }
        }

        // Generate full PDF
        const pdfPath = path.join(outputDir, 'allure-report.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
            printBackground: true,
            preferCSSPageSize: true,
            scale: 0.8
        });

        console.log(`✅ Report generated successfully in: ${outputDir}`);

    } catch (error) {
        console.error('❌ Error generating report:', error);
        if (browser) {
            const page = (await browser.pages())[0];
            const errorPath = path.join(__dirname, '../test-reports', 'error.png');
            await page.screenshot({ path: errorPath, fullPage: true });
            console.log(`Error screenshot saved to: ${errorPath}`);
        }
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

generatePDF().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});