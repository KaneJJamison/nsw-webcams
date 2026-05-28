/**
 * Takes App Store screenshots of the NSW Coastal Webcams app
 * Captures 4 screens at iPhone dimensions, then resizes to App Store requirements
 * Run: node scripts/take-screenshots.js
 */

const puppeteer = require('puppeteer-core');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// App Store required dimensions
const STORE_WIDTH  = 1284;
const STORE_HEIGHT = 2778; // 6.5" iPhone

// Capture at 2x (logical → physical)
const VIEWPORT_W = 390;
const VIEWPORT_H = 844;
const DPR        = 3; // device pixel ratio

const BASE_URL = 'http://localhost:8083';
const OUT_DIR  = path.join(__dirname, '../app-store-assets/screenshots');

const CHROME_PATH =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SCREENS = [
  {
    name: '1-home',
    url: BASE_URL,
    description: 'Home screen — region filters & camera list',
    waitFor: 3000,
  },
  {
    name: '2-camera',
    url: BASE_URL,
    description: 'Live camera feed & weather',
    waitFor: 4000,
    action: async (page) => {
      // Star a couple of cameras first so favourites screen looks populated too
      await page.evaluate(() => {
        const stars = [...document.querySelectorAll('div')].filter(
          el => el.textContent.trim() === '☆' && el.children.length === 0
        );
        if (stars[0]) stars[0].click();
        if (stars[1]) stars[1].click();
      });
      await new Promise(r => setTimeout(r, 500));
      // Click on the "Lake Eucumbene" camera row (the › arrow area)
      const clicked = await page.evaluate(() => {
        const allDivs = [...document.querySelectorAll('div')];
        // Find a row that contains the camera name text
        const cameraNames = ['Lake Eucumbene', 'Tweed Heads', 'Ballina', 'Port Macquarie'];
        for (const name of cameraNames) {
          const nameEl = allDivs.find(el => el.textContent.trim() === name && el.children.length === 0);
          if (nameEl) {
            // Walk up to find the clickable row container
            let parent = nameEl.parentElement;
            for (let i = 0; i < 5; i++) {
              if (parent && (parent.getAttribute('role') === 'button' || parent.style.cursor === 'pointer' || parent.onclick)) {
                parent.click();
                return name;
              }
              parent = parent?.parentElement;
            }
            // Fallback: click the text element's grandparent
            nameEl.parentElement?.parentElement?.click();
            return name + ' (fallback)';
          }
        }
        return 'not found';
      });
      console.log(`  Clicked camera: ${clicked}`);
      await new Promise(r => setTimeout(r, 4000));
    },
  },
  {
    name: '3-explore',
    url: BASE_URL,
    description: 'Interactive map view',
    waitFor: 3000,
    action: async (page) => {
      await page.evaluate(() => {
        const tabs = [...document.querySelectorAll('[role="tab"]')];
        const explore = tabs.find(t => t.textContent.includes('Explore'));
        if (explore) explore.click();
      });
      await new Promise(r => setTimeout(r, 3000));
    },
  },
  {
    name: '4-favourites',
    url: BASE_URL,
    description: 'Favourites screen with saved cameras',
    waitFor: 2000,
    action: async (page) => {
      // Star 3 cameras first
      await page.evaluate(() => {
        const stars = [...document.querySelectorAll('div')].filter(
          el => el.textContent.trim() === '☆' && el.children.length === 0
        );
        [0, 1, 2].forEach(i => { if (stars[i]) stars[i].click(); });
      });
      await new Promise(r => setTimeout(r, 500));
      // Navigate to Favourites tab
      await page.evaluate(() => {
        const tabs = [...document.querySelectorAll('[role="tab"]')];
        const fav = tabs.find(t => t.textContent.includes('Favourites'));
        if (fav) fav.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    },
  },
];

async function resizeToAppStore(inputPath, outputPath) {
  const img = await Jimp.read(inputPath);
  // Scale to fill App Store dimensions, center crop if needed
  img
    .cover(STORE_WIDTH, STORE_HEIGHT)
    .quality(95)
    .write(outputPath);
  console.log(`  ✅ Resized → ${path.basename(outputPath)} (${STORE_WIDTH}×${STORE_HEIGHT})`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: {
      width: VIEWPORT_W,
      height: VIEWPORT_H,
      deviceScaleFactor: DPR,
    },
  });

  for (const screen of SCREENS) {
    console.log(`\n📸 Capturing: ${screen.description}`);
    const page = await browser.newPage();
    await page.goto(screen.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, screen.waitFor));

    if (screen.action) {
      await screen.action(page);
    }

    const rawPath = path.join(OUT_DIR, `${screen.name}-raw.png`);
    const finalPath = path.join(OUT_DIR, `${screen.name}.jpg`);

    await page.screenshot({ path: rawPath, fullPage: false });
    console.log(`  📷 Captured raw screenshot`);

    await resizeToAppStore(rawPath, finalPath);
    fs.unlinkSync(rawPath); // clean up raw file

    await page.close();
  }

  await browser.close();

  console.log(`\n✅ All screenshots saved to: ${OUT_DIR}`);
  console.log(`\nScreenshots ready for App Store Connect (${STORE_WIDTH}×${STORE_HEIGHT}):`);
  fs.readdirSync(OUT_DIR).forEach(f => console.log(`  • ${f}`));
})();
