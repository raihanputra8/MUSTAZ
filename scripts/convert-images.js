const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  // Sharp not yet installed locally
}

const TARGET_DIRS = [
  path.join(__dirname, '../assets/images'),
  path.join(__dirname, '../assets/banner')
];

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      const ext = path.extname(entry.name);
      const outPath = fullPath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');

      const origSize = fs.statSync(fullPath).size;
      await sharp(fullPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outPath);
      
      const newSize = fs.statSync(outPath).size;
      const reduction = Math.round((1 - newSize / origSize) * 100);
      console.log(`[sharp] ✓ ${entry.name} -> ${path.basename(outPath)} (${Math.round(origSize / 1024)}KB -> ${Math.round(newSize / 1024)}KB, -${reduction}%)`);
    }
  }
}

async function run() {
  if (!sharp) {
    console.error('Sharp is not installed. Run: npm install --save-dev sharp');
    console.error('Or use the bash conversion script: bash scripts/convert_images.sh');
    process.exit(1);
  }

  console.log('⚡ Starting WebP conversion (Quality: 80%)...');
  for (const dir of TARGET_DIRS) {
    console.log(`Scanning: ${dir}`);
    await processDirectory(dir);
  }
  console.log('✨ All images converted successfully!');
}

run().catch(console.error);
