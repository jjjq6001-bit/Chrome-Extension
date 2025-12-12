import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// 确保 dist 目录存在
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 复制 manifest.json
copyFileSync(
  join(rootDir, 'manifest.json'),
  join(distDir, 'manifest.json')
);
console.log('✓ Copied manifest.json');

// 复制图标
const iconsDir = join(rootDir, 'public', 'icons');
const distIconsDir = join(distDir, 'icons');

if (!existsSync(distIconsDir)) {
  mkdirSync(distIconsDir, { recursive: true });
}

if (existsSync(iconsDir)) {
  const icons = readdirSync(iconsDir);
  icons.forEach(icon => {
    copyFileSync(
      join(iconsDir, icon),
      join(distIconsDir, icon)
    );
    console.log(`✓ Copied ${icon}`);
  });
}

// 重命名 popup HTML
const popupSrc = join(distDir, 'src', 'popup', 'index.html');
const popupDest = join(distDir, 'popup.html');

if (existsSync(popupSrc)) {
  const fs = await import('fs');
  let html = fs.readFileSync(popupSrc, 'utf-8');
  // 修复资源路径
  html = html.replace(/src="\/src\/popup\//g, 'src="./');
  html = html.replace(/href="\/src\/popup\//g, 'href="./');
  fs.writeFileSync(popupDest, html);
  console.log('✓ Created popup.html');
}

console.log('\n✅ Build completed! Load the "dist" folder in Chrome.');
