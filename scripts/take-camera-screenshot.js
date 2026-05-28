/**
 * Takes a camera detail screenshot scrolled to show the weather section
 */
const puppeteer = require('puppeteer-core');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const STORE_W = 1284, STORE_H = 2778;
const VIEWPORT_W = 390, VIEWPORT_H = 844, DPR = 3;
const BASE_URL = 'http://localhost:8083';
const OUT_DIR = path.join(__dirname, '../app-store-assets/screenshots');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
    defaultViewport: { width: VIEWPORT_W, height: VIEWPORT_H, deviceScaleFactor: DPR },
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Click on Tweed Heads
  const clicked = await page.evaluate(() => {
    const allDivs = [...document.querySelectorAll('div')];
    const nameEl = allDivs.find(el => el.textContent.trim() === 'Tweed Heads' && el.children.length === 0);
    if (nameEl) {
      let p = nameEl.parentElement;
      for (let i = 0; i < 6; i++) { p?.click(); p = p?.parentElement; }
      return 'clicked';
    }
    return 'not found';
  });
  console.log('Camera click:', clicked);
  await new Promise(r => setTimeout(r, 5000));

  // Scroll down to bring weather section into view (past the video + ad)
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 2000));

  const rawPath = path.join(OUT_DIR, '2-camera-raw.png');
  const finalPath = path.join(OUT_DIR, '2-camera.jpg');

  await page.screenshot({ path: rawPath, fullPage: false });
  console.log('Screenshot captured');

  const img = await Jimp.read(rawPath);
  img.cover(STORE_W, STORE_H).quality(95).write(finalPath);
  console.log(`✅ Saved ${STORE_W}×${STORE_H} → ${finalPath}`);
  fs.unlinkSync(rawPath);

  await browser.close();
})();
