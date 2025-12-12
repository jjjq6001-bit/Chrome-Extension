// 生成商店宣传图
// 运行: node scripts/generate-promo.js

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'store-assets');

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// 创建宣传图 (440x280)
async function createPromoSmall() {
  const width = 440;
  const height = 280;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e1b4b"/>
          <stop offset="100%" style="stop-color:#312e81"/>
        </linearGradient>
      </defs>
      
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- 装饰圆圈 -->
      <circle cx="380" cy="50" r="80" fill="#6366f1" opacity="0.2"/>
      <circle cx="60" cy="230" r="60" fill="#818cf8" opacity="0.15"/>
      
      <!-- 图标 -->
      <rect x="30" y="80" width="80" height="80" rx="16" fill="#6366f1"/>
      <path d="M50 105 L70 125 L90 105" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="70" y1="125" x2="70" y2="145" stroke="white" stroke-width="6" stroke-linecap="round"/>
      
      <!-- 标题 -->
      <text x="130" y="115" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">VideoGrabber Pro</text>
      <text x="130" y="145" font-family="Arial, sans-serif" font-size="14" fill="#a5b4fc">户部尚赢智能视频下载</text>
      
      <!-- 特性列表 -->
      <text x="30" y="200" font-family="Arial, sans-serif" font-size="12" fill="#c7d2fe">✓ 智能视频检测</text>
      <text x="30" y="220" font-family="Arial, sans-serif" font-size="12" fill="#c7d2fe">✓ 多清晰度选择</text>
      <text x="30" y="240" font-family="Arial, sans-serif" font-size="12" fill="#c7d2fe">✓ 断点续传</text>
      
      <text x="180" y="200" font-family="Arial, sans-serif" font-size="12" fill="#c7d2fe">✓ 多线程下载</text>
      <text x="180" y="220" font-family="Arial, sans-serif" font-size="12" fill="#c7d2fe">✓ 现代化界面</text>
      <text x="180" y="240" font-family="Arial, sans-serif" font-size="12" fill="#c7d2fe">✓ 无需注册</text>
      
      <!-- 版本标签 -->
      <rect x="340" y="240" width="80" height="24" rx="12" fill="#22c55e"/>
      <text x="380" y="257" font-family="Arial, sans-serif" font-size="11" fill="white" text-anchor="middle">FREE</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'promo-small-440x280.png'));
  
  console.log('✓ Generated promo-small-440x280.png');
}

// 创建大宣传图 (1400x560)
async function createPromoLarge() {
  const width = 1400;
  const height = 560;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgLarge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e1b4b"/>
          <stop offset="50%" style="stop-color:#312e81"/>
          <stop offset="100%" style="stop-color:#1e1b4b"/>
        </linearGradient>
      </defs>
      
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="url(#bgLarge)"/>
      
      <!-- 装饰元素 -->
      <circle cx="1300" cy="100" r="200" fill="#6366f1" opacity="0.15"/>
      <circle cx="100" cy="460" r="150" fill="#818cf8" opacity="0.1"/>
      <circle cx="700" cy="280" r="300" fill="#4f46e5" opacity="0.05"/>
      
      <!-- 左侧内容 -->
      <!-- 图标 -->
      <rect x="100" y="180" width="120" height="120" rx="24" fill="#6366f1"/>
      <path d="M130 220 L160 260 L190 220" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="160" y1="260" x2="160" y2="280" stroke="white" stroke-width="8" stroke-linecap="round"/>
      
      <!-- 标题 -->
      <text x="250" y="230" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">HBSY VideoGrabber Pro</text>
      <text x="250" y="280" font-family="Arial, sans-serif" font-size="24" fill="#a5b4fc">户部尚赢智能视频下载</text>
      
      <!-- 描述 -->
      <text x="100" y="360" font-family="Arial, sans-serif" font-size="18" fill="#c7d2fe">专业的视频下载扩展，支持多清晰度、断点续传、多线程加速</text>
      
      <!-- 特性卡片 -->
      <rect x="100" y="400" width="180" height="80" rx="12" fill="#1f2937" opacity="0.8"/>
      <text x="190" y="435" font-family="Arial, sans-serif" font-size="14" fill="#6366f1" text-anchor="middle">🎯 智能检测</text>
      <text x="190" y="460" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">自动识别视频</text>
      
      <rect x="300" y="400" width="180" height="80" rx="12" fill="#1f2937" opacity="0.8"/>
      <text x="390" y="435" font-family="Arial, sans-serif" font-size="14" fill="#22c55e" text-anchor="middle">📊 多清晰度</text>
      <text x="390" y="460" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">360p-4K 可选</text>
      
      <rect x="500" y="400" width="180" height="80" rx="12" fill="#1f2937" opacity="0.8"/>
      <text x="590" y="435" font-family="Arial, sans-serif" font-size="14" fill="#f59e0b" text-anchor="middle">🔄 断点续传</text>
      <text x="590" y="460" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">中断可恢复</text>
      
      <rect x="700" y="400" width="180" height="80" rx="12" fill="#1f2937" opacity="0.8"/>
      <text x="790" y="435" font-family="Arial, sans-serif" font-size="14" fill="#ec4899" text-anchor="middle">⚡ 多线程</text>
      <text x="790" y="460" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">加速下载</text>
      
      <!-- 右侧模拟界面 -->
      <rect x="950" y="120" width="350" height="320" rx="16" fill="#111827" stroke="#374151" stroke-width="2"/>
      
      <!-- 模拟 Header -->
      <rect x="950" y="120" width="350" height="50" rx="16" fill="#1f2937"/>
      <circle cx="980" cy="145" r="12" fill="#6366f1"/>
      <text x="1000" y="150" font-family="Arial, sans-serif" font-size="14" fill="white">户部尚赢智能视频下载</text>
      
      <!-- 模拟视频卡片 -->
      <rect x="970" y="190" width="310" height="70" rx="8" fill="#1f2937"/>
      <rect x="985" y="205" width="80" height="45" rx="4" fill="#374151"/>
      <text x="1085" y="225" font-family="Arial, sans-serif" font-size="12" fill="white">示例视频.mp4</text>
      <text x="1085" y="242" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">1080p • 5:30</text>
      <rect x="1230" y="215" width="30" height="24" rx="4" fill="#6366f1"/>
      
      <rect x="970" y="270" width="310" height="70" rx="8" fill="#1f2937"/>
      <rect x="985" y="285" width="80" height="45" rx="4" fill="#374151"/>
      <text x="1085" y="305" font-family="Arial, sans-serif" font-size="12" fill="white">教程视频.mp4</text>
      <text x="1085" y="322" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">720p • 12:45</text>
      <rect x="1230" y="295" width="30" height="24" rx="4" fill="#22c55e"/>
      
      <!-- 进度条 -->
      <rect x="970" y="360" width="310" height="50" rx="8" fill="#1f2937"/>
      <text x="985" y="380" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">下载中... 2.5 MB/s</text>
      <rect x="985" y="390" width="280" height="6" rx="3" fill="#374151"/>
      <rect x="985" y="390" width="180" height="6" rx="3" fill="#6366f1"/>
      <text x="1250" y="400" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">65%</text>
      
      <!-- FREE 标签 -->
      <rect x="1200" y="80" width="100" height="36" rx="18" fill="#22c55e"/>
      <text x="1250" y="104" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">FREE</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'promo-large-1400x560.png'));
  
  console.log('✓ Generated promo-large-1400x560.png');
}

// 创建截图背景 (1280x800)
async function createScreenshotBg() {
  const width = 1280;
  const height = 800;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="screenshotBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a"/>
          <stop offset="100%" style="stop-color:#1e1b4b"/>
        </linearGradient>
      </defs>
      
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="url(#screenshotBg)"/>
      
      <!-- 装饰 -->
      <circle cx="1100" cy="150" r="200" fill="#6366f1" opacity="0.1"/>
      <circle cx="180" cy="650" r="150" fill="#818cf8" opacity="0.08"/>
      
      <!-- 标题 -->
      <text x="640" y="80" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">HBSY VideoGrabber Pro</text>
      <text x="640" y="115" font-family="Arial, sans-serif" font-size="18" fill="#a5b4fc" text-anchor="middle">户部尚赢智能视频下载 - 智能检测，一键下载</text>
      
      <!-- 中央放置扩展截图的区域提示 -->
      <rect x="340" y="160" width="600" height="500" rx="16" fill="#1f2937" stroke="#374151" stroke-width="2" stroke-dasharray="10,5"/>
      <text x="640" y="420" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">扩展界面截图放置区域</text>
      <text x="640" y="445" font-family="Arial, sans-serif" font-size="12" fill="#4b5563" text-anchor="middle">(请手动截取扩展弹窗并合成)</text>
      
      <!-- 底部特性 -->
      <text x="200" y="720" font-family="Arial, sans-serif" font-size="14" fill="#c7d2fe">✓ 智能视频检测</text>
      <text x="400" y="720" font-family="Arial, sans-serif" font-size="14" fill="#c7d2fe">✓ 多清晰度选择</text>
      <text x="600" y="720" font-family="Arial, sans-serif" font-size="14" fill="#c7d2fe">✓ 断点续传</text>
      <text x="800" y="720" font-family="Arial, sans-serif" font-size="14" fill="#c7d2fe">✓ 多线程下载</text>
      <text x="1000" y="720" font-family="Arial, sans-serif" font-size="14" fill="#c7d2fe">✓ 免费使用</text>
      
      <!-- 版本信息 -->
      <text x="640" y="770" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">Version 1.0.0 | 户部尚赢出品</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'screenshot-bg-1280x800.png'));
  
  console.log('✓ Generated screenshot-bg-1280x800.png');
}

// 生成所有图片
async function generateAll() {
  console.log('Generating store assets...\n');
  
  await createPromoSmall();
  await createPromoLarge();
  await createScreenshotBg();
  
  console.log('\n✅ All store assets generated in:', outputDir);
  console.log('\nNext steps:');
  console.log('1. Take a screenshot of the extension popup');
  console.log('2. Composite it onto screenshot-bg-1280x800.png');
  console.log('3. Upload all images to Chrome Web Store');
}

generateAll().catch(console.error);
