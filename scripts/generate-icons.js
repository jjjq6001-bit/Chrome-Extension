// 生成 PNG 图标
// 运行: node scripts/generate-icons.js

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const createSvg = (size) => {
  const r = Math.round(size * 0.15);
  const sw = Math.max(2, Math.round(size * 0.12));
  
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${r}" fill="#6366f1"/>
    <path d="M${size * 0.25} ${size * 0.35} L${size * 0.5} ${size * 0.6} L${size * 0.75} ${size * 0.35}" 
          stroke="white" stroke-width="${sw}" fill="none" 
          stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="${size * 0.5}" y1="${size * 0.6}" x2="${size * 0.5}" y2="${size * 0.75}" 
          stroke="white" stroke-width="${sw}" stroke-linecap="round"/>
  </svg>`);
};

async function generateIcons() {
  const sizes = [16, 48, 128];
  
  for (const size of sizes) {
    const svg = createSvg(size);
    const outputPath = join(iconsDir, `icon${size}.png`);
    
    await sharp(svg)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated icon${size}.png`);
  }
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
