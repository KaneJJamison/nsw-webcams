// Tiny server that receives a base64 screenshot from the browser and saves it to disk
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../app-store-assets/screenshots/2-camera-raw.png');
const STORE_W = 1284, STORE_H = 2778;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { image } = JSON.parse(body);
        const base64 = image.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(OUT, Buffer.from(base64, 'base64'));
        console.log(`✅ Screenshot saved to ${OUT}`);

        // Resize with jimp
        const Jimp = require('jimp');
        const img = await Jimp.read(OUT);
        const finalPath = OUT.replace('-raw.png', '.jpg');
        img.cover(STORE_W, STORE_H).quality(95).write(finalPath);
        console.log(`✅ Resized to ${STORE_W}×${STORE_H} → ${finalPath}`);
        fs.unlinkSync(OUT);

        res.writeHead(200); res.end('saved');
      } catch (e) {
        console.error(e);
        res.writeHead(500); res.end(e.message);
      }
      server.close();
    });
  }
});

server.listen(9999, () => console.log('📡 Receiver listening on http://localhost:9999 — waiting for screenshot...'));
