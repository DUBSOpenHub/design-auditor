/**
 * Design Auditor — Audit Orchestrator
 * 
 * Orchestrates the full audit pipeline:
 * 1. Capture (Playwright screenshots + DOM extraction)
 * 2. Performance (Lighthouse)
 * 3. Accessibility (axe-core via Playwright)
 * 4. Analysis (score + rank findings)
 * 5. Report (generate DESIGN-AUDIT.md)
 * 
 * Usage: node scripts/audit.js <url> [--output-dir .audit] [--vertical saas]
 */

const { capture } = require('./capture');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runLighthouse(url, outputDir, runs = 3) {
  const scores = [];

  for (let i = 0; i < runs; i++) {
    const outFile = path.join(outputDir, `lighthouse-run-${i + 1}.json`);
    try {
      execSync(
        `npx lighthouse "${url}" --output=json --output-path="${outFile}" ` +
        `--only-categories=performance,accessibility ` +
        `--chrome-flags="--headless --no-sandbox" --quiet`,
        { timeout: 60000, stdio: 'pipe' }
      );
      const report = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      scores.push({
        performance: Math.round((report.categories?.performance?.score || 0) * 100),
        accessibility: Math.round((report.categories?.accessibility?.score || 0) * 100),
        lcp: report.audits?.['largest-contentful-paint']?.numericValue / 1000 || null,
        cls: report.audits?.['cumulative-layout-shift']?.numericValue || null,
        fid: report.audits?.['max-potential-fid']?.numericValue || null,
        totalWeight: report.audits?.['total-byte-weight']?.numericValue / (1024 * 1024) || null,
      });
    } catch (e) {
      console.warn(`⚠️  Lighthouse run ${i + 1} failed: ${e.message}`);
    }
  }

  if (scores.length === 0) return null;

  // Return median scores
  const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    performance: median(scores.map(s => s.performance)),
    accessibility: median(scores.map(s => s.accessibility)),
    lcp: median(scores.filter(s => s.lcp).map(s => s.lcp)),
    cls: median(scores.filter(s => s.cls).map(s => s.cls)),
    fid: median(scores.filter(s => s.fid).map(s => s.fid)),
    totalWeight: median(scores.filter(s => s.totalWeight).map(s => s.totalWeight)),
    runsCompleted: scores.length,
    variance: scores.length >= 2 
      ? Math.abs(scores[0].performance - scores[scores.length - 1].performance)
      : 0,
  };
}

async function runAxe(url) {
  // axe-core requires a running Playwright page
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

    // Inject axe-core and run
    const results = await page.evaluate(async () => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js';
      document.head.appendChild(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      return await window.axe.run();
    });

    const violations = results.violations || [];
    return {
      total: violations.length,
      critical: violations.filter(v => v.impact === 'critical').length,
      serious: violations.filter(v => v.impact === 'serious').length,
      moderate: violations.filter(v => v.impact === 'moderate').length,
      minor: violations.filter(v => v.impact === 'minor').length,
      top3: violations.slice(0, 3).map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        element: v.nodes?.[0]?.target?.[0] || 'unknown',
      })),
    };
  } catch (e) {
    console.warn(`⚠️  axe-core scan failed: ${e.message}`);
    return null;
  } finally {
    await browser.close();
  }
}

function computeScore(dom, lighthouse, axe) {
  let score = { total: 0, breakdown: {} };

  // Performance (25 pts) — based on Lighthouse performance score
  const perfPoints = lighthouse ? Math.round((lighthouse.performance / 100) * 25) : 0;
  score.breakdown.performance = perfPoints;
  score.total += perfPoints;

  // CTA Effectiveness (20 pts)
  let ctaPoints = 0;
  if (dom?.ctas?.length > 0) {
    ctaPoints += 5; // Has CTAs
    const aboveFold = dom.ctas.filter(c => c.aboveFold);
    if (aboveFold.length > 0) ctaPoints += 10; // CTA above fold
    // Size check — CTA should be reasonably large
    const largeCta = dom.ctas.find(c => c.width >= 100 && c.height >= 40);
    if (largeCta) ctaPoints += 5;
  }
  score.breakdown.cta_effectiveness = ctaPoints;
  score.total += ctaPoints;

  // Visual Hierarchy (15 pts)
  let hierarchyPoints = 0;
  if (dom?.headings?.length > 0) {
    const h1s = dom.headings.filter(h => h.tag === 'h1');
    if (h1s.length === 1) hierarchyPoints += 8; // Exactly one H1
    else if (h1s.length > 0) hierarchyPoints += 4; // Has H1 but multiple
    // H1 appears first
    if (dom.headings[0]?.tag === 'h1') hierarchyPoints += 4;
    // Has sub-headings
    if (dom.headings.filter(h => h.tag === 'h2').length > 0) hierarchyPoints += 3;
  }
  score.breakdown.visual_hierarchy = hierarchyPoints;
  score.total += hierarchyPoints;

  // Accessibility (15 pts) — based on Lighthouse a11y + axe results
  let a11yPoints = 0;
  if (lighthouse) a11yPoints += Math.round((lighthouse.accessibility / 100) * 10);
  if (axe) {
    if (axe.critical === 0) a11yPoints += 3;
    if (axe.serious === 0) a11yPoints += 2;
  }
  score.breakdown.accessibility = Math.min(a11yPoints, 15);
  score.total += Math.min(a11yPoints, 15);

  // Social Proof (10 pts)
  let socialPoints = 0;
  if (dom?.socialProof?.length > 0) {
    socialPoints += 5;
    if (dom.socialProof.some(s => s.aboveFold)) socialPoints += 5;
  }
  score.breakdown.social_proof = socialPoints;
  score.total += socialPoints;

  // Mobile Readiness (10 pts) — based on body font size
  let mobilePoints = 5; // Default: assume OK
  if (dom?.bodyFontSize) {
    const size = parseInt(dom.bodyFontSize);
    if (size >= 16) mobilePoints = 10;
    else if (size >= 14) mobilePoints = 7;
    else mobilePoints = 3;
  }
  score.breakdown.mobile_readiness = mobilePoints;
  score.total += mobilePoints;

  // Image Optimization (5 pts)
  let imagePoints = 5;
  if (dom?.images?.length > 0) {
    const missingAlt = dom.images.filter(i => !i.hasAlt).length;
    if (missingAlt > 0) imagePoints -= 2;
    // Can't check format/size from DOM alone — Lighthouse covers this
  }
  score.breakdown.image_optimization = Math.max(imagePoints, 0);
  score.total += Math.max(imagePoints, 0);

  return score;
}

async function audit(url, options = {}) {
  const outputDir = options.outputDir || '.audit';
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`🔍 Starting audit: ${url}`);
  console.log('');

  // Step 1: Capture
  console.log('📸 Step 1/4 — Capturing screenshots + DOM...');
  const captureResults = await capture(url, outputDir);
  if (captureResults.error) {
    console.warn(`⚠️  ${captureResults.error}`);
  }

  // Step 2: Lighthouse
  console.log('⚡ Step 2/4 — Running Lighthouse...');
  const lighthouse = await runLighthouse(url, outputDir);

  // Step 3: Accessibility
  console.log('♿ Step 3/4 — Running accessibility scan...');
  const axe = await runAxe(url);

  // Step 4: Score
  console.log('📊 Step 4/4 — Computing score...');
  const score = computeScore(captureResults.dom, lighthouse, axe);

  // Write full results
  const fullResults = {
    url,
    vertical: options.vertical || 'auto',
    score,
    capture: captureResults,
    lighthouse,
    axe,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(outputDir, 'audit-results.json'),
    JSON.stringify(fullResults, null, 2)
  );

  // Print summary
  console.log('');
  console.log(`🔍 Design Audit Complete — ${url}`);
  console.log('');
  console.log(`Design Score: ${score.total}/100`);
  console.log('');
  Object.entries(score.breakdown).forEach(([cat, pts]) => {
    console.log(`  ${cat}: ${pts}`);
  });
  console.log('');
  if (lighthouse) {
    console.log(`Performance: ${lighthouse.performance}/100 | LCP: ${lighthouse.lcp?.toFixed(1)}s | CLS: ${lighthouse.cls?.toFixed(3)}`);
  }
  if (axe) {
    console.log(`Accessibility violations: ${axe.total} (${axe.critical} critical, ${axe.serious} serious)`);
  }
  console.log('');
  console.log(`📁 Full results: ${outputDir}/audit-results.json`);
  console.log('💡 Use the Design Auditor skill to generate the full DESIGN-AUDIT.md report with recommendations.');

  return fullResults;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0];

  if (!url) {
    console.error('Usage: node scripts/audit.js <url> [--output-dir .audit] [--vertical saas]');
    process.exit(1);
  }

  const options = {};
  for (let i = 1; i < args.length; i += 2) {
    if (args[i] === '--output-dir') options.outputDir = args[i + 1];
    if (args[i] === '--vertical') options.vertical = args[i + 1];
  }

  audit(url, options).catch(err => {
    console.error(`❌ Audit failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { audit };
