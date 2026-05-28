/**
 * Takes iPad Pro 13" App Store screenshots (2064×2752)
 * Viewport: 1032×1376 @ 2x deviceScaleFactor
 */
const puppeteer = require('puppeteer-core');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const STORE_W  = 2064;
const STORE_H  = 2752;
const VP_W     = 1032;
const VP_H     = 1376;
const DPR      = 2;
const BASE_URL = 'http://localhost:8083';
const OUT_DIR  = path.join(__dirname, '../app-store-assets/screenshots/ipad');
const CHROME   = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

fs.mkdirSync(OUT_DIR, { recursive: true });

async function capture(browser, name, description, actionFn) {
  console.log(`\n📸 ${description}`);
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  if (actionFn) await actionFn(page);
  const rawPath = path.join(OUT_DIR, `${name}-raw.png`);
  const outPath = path.join(OUT_DIR, `${name}.jpg`);
  await page.screenshot({ path: rawPath });
  const img = await Jimp.read(rawPath);
  img.cover(STORE_W, STORE_H).quality(95).write(outPath);
  fs.unlinkSync(rawPath);
  console.log(`  ✅ ${name}.jpg  (${STORE_W}×${STORE_H})`);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: VP_W, height: VP_H, deviceScaleFactor: DPR },
  });

  // 1 — Home screen
  await capture(browser, '1-home', 'Home — region filters & camera list');

  // 2 — Camera detail with live feed + weather (scroll to show both)
  await capture(browser, '2-camera', 'Camera detail — live feed + weather', async (page) => {
    // Click Tweed Heads
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('div')]
        .find(d => d.textContent.trim() === 'Tweed Heads' && d.children.length === 0);
      if (el) { let p = el.parentElement; for (let i = 0; i < 6; i++) { p?.click(); p = p?.parentElement; } }
    });
    await new Promise(r => setTimeout(r, 5000));
    await page.evaluate(() => window.scrollBy(0, 200));
    await new Promise(r => setTimeout(r, 1500));
  });

  // 3 — Explore map
  await capture(browser, '3-explore', 'Explore — interactive map', async (page) => {
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      tabs.find(t => t.textContent.includes('Explore'))?.click();
    });
    await new Promise(r => setTimeout(r, 3500));
  });

  // 4 — Favourites (with cameras starred)
  await capture(browser, '4-favourites', 'Favourites — saved cameras', async (page) => {
    await page.evaluate(() => {
      const stars = [...document.querySelectorAll('div')]
        .filter(d => d.textContent.trim() === '☆' && d.children.length === 0);
      [0,1,2,3].forEach(i => stars[i]?.click());
    });
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      tabs.find(t => t.textContent.includes('Favourites'))?.click();
    });
    await new Promise(r => setTimeout(r, 2000));
  });

  await browser.close();

  console.log(`\n✅ iPad screenshots saved to: ${OUT_DIR}`);
  console.log(`Ready for App Store Connect — iPad Pro 13" (${STORE_W}×${STORE_H}):`);
  fs.readdirSync(OUT_DIR).forEach(f => console.log(`  • ${f}`));
})();
