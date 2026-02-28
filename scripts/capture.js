/**
 * Design Auditor — Capture Script
 * 
 * Launches Playwright, navigates to a URL, captures screenshots at multiple
 * viewports, and extracts DOM structure for analysis.
 * 
 * Usage: node scripts/capture.js <url> [--output-dir .audit]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = [
  { width: 1440, height: 900, label: 'desktop' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 375, height: 812, label: 'mobile' },
];

async function capture(url, outputDir = '.audit') {
  const screenshotDir = path.join(outputDir, 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = { url, viewports: [], dom: null, error: null };

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e) {
        // Fallback to domcontentloaded if networkidle times out
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await page.waitForTimeout(3000);
        } catch (e2) {
          results.error = `Failed to load ${url}: ${e2.message}`;
          await context.close();
          continue;
        }
      }

      // Check if page rendered (SPA detection)
      const visibleElements = await page.evaluate(() => {
        const all = document.querySelectorAll('body *');
        let visible = 0;
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) visible++;
          if (visible >= 5) break;
        }
        return visible;
      });

      if (visibleElements < 3) {
        results.error = 'SPA render issue: fewer than 3 visible elements after load. Try a local dev server URL.';
      }

      // Full-page screenshot
      const screenshotPath = path.join(screenshotDir, `${vp.label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      results.viewports.push({
        label: vp.label,
        width: vp.width,
        height: vp.height,
        screenshot: screenshotPath,
        visibleElements,
      });

      // Extract DOM structure on desktop viewport only
      if (vp.label === 'desktop' && !results.dom) {
        results.dom = await page.evaluate(() => {
          const extract = {};

          // Headings
          extract.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName.toLowerCase(),
            text: h.textContent.trim().substring(0, 200),
            top: h.getBoundingClientRect().top,
          }));

          // CTAs (buttons and action links)
          const ctaKeywords = /sign up|get started|start|try|buy|subscribe|join|download|book|schedule|contact|demo/i;
          extract.ctas = Array.from(document.querySelectorAll('button, a[href]')).filter(el => {
            const text = el.textContent.trim();
            return ctaKeywords.test(text) || el.getAttribute('role') === 'button';
          }).slice(0, 10).map(el => {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              text: el.textContent.trim().substring(0, 100),
              href: el.getAttribute('href'),
              top: rect.top,
              width: rect.width,
              height: rect.height,
              aboveFold: rect.top < 800,
              bgColor: styles.backgroundColor,
              textColor: styles.color,
              fontSize: styles.fontSize,
            };
          });

          // Images
          extract.images = Array.from(document.querySelectorAll('img')).slice(0, 20).map(img => ({
            src: img.src,
            alt: img.alt || null,
            width: img.naturalWidth,
            height: img.naturalHeight,
            hasAlt: !!img.alt,
          }));

          // Social proof signals
          const proofKeywords = /testimonial|review|customer|client|partner|trust|logo|star|rating/i;
          extract.socialProof = Array.from(document.querySelectorAll('section, div')).filter(el => {
            return proofKeywords.test(el.className) || proofKeywords.test(el.id) || 
                   proofKeywords.test(el.getAttribute('data-testid') || '');
          }).slice(0, 5).map(el => ({
            selector: el.id ? `#${el.id}` : `.${el.className.split(' ')[0]}`,
            top: el.getBoundingClientRect().top,
            aboveFold: el.getBoundingClientRect().top < 800,
          }));

          // Body font size
          extract.bodyFontSize = window.getComputedStyle(document.body).fontSize;

          // Page title
          extract.title = document.title;

          // Meta description
          const metaDesc = document.querySelector('meta[name="description"]');
          extract.metaDescription = metaDesc ? metaDesc.getAttribute('content') : null;

          return extract;
        });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // Write DOM extraction results
  const domPath = path.join(outputDir, 'dom-extract.json');
  fs.writeFileSync(domPath, JSON.stringify(results, null, 2));

  return results;
}

// CLI entry point
if (require.main === module) {
  const url = process.argv[2];
  const outputDir = process.argv[3] || '.audit';

  if (!url) {
    console.error('Usage: node scripts/capture.js <url> [--output-dir .audit]');
    process.exit(1);
  }

  capture(url, outputDir)
    .then(results => {
      console.log(`✅ Captured ${results.viewports.length} viewports`);
      if (results.error) console.warn(`⚠️  ${results.error}`);
      console.log(`📁 Output: ${outputDir}/`);
    })
    .catch(err => {
      console.error(`❌ Capture failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { capture };
