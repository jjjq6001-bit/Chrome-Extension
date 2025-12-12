#!/usr/bin/env node
/**
 * HBSY VideoGrabber Pro - 智能推广文案生成器
 * 
 * 功能：
 * 1. 读取 manifest.json 获取版本和描述
 * 2. 使用 AI (OpenAI) 或模板生成不同风格的推广文案
 * 3. 输出到 promo/ 目录供复制粘贴
 * 
 * 使用方法：
 *   node scripts/generate_promo.js
 *   node scripts/generate_promo.js --ai  # 使用 AI 生成
 * 
 * 环境变量：
 *   OPENAI_API_KEY - OpenAI API Key (可选，用于 AI 生成)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = join(__dirname, '..');
const outputDir = join(projectDir, 'promo');

// ============================================================
// 配置
// ============================================================

const CONFIG = {
  productName: 'HBSY VideoGrabber Pro',
  productNameCN: '户部尚赢智能视频下载',
  features: [
    '智能视频检测',
    '多清晰度选择 (360p-4K)',
    '断点续传',
    '多线程加速下载',
    '现代化深色界面',
    '无需注册，即装即用',
    '完全免费，无广告',
    '隐私安全，本地处理',
  ],
  featuresCN: [
    '🎯 智能检测 - 自动识别��面视频',
    '📊 多清晰度 - 支持 360p 到 4K',
    '🔄 断点续传 - 中断可恢复',
    '⚡ 多线程 - 加速下载',
    '🎨 现代界面 - 深色主题',
    '🆓 永久免费 - 无任何收费',
    '🚫 无广告 - 纯净体验',
    '🔒 隐私安全 - 数据不上传',
  ],
  supportedSites: [
    '好看视频',
    '搜狐视频',
    '各类小型视频站',
    'HTML5 视频网站',
  ],
  techStack: [
    'React 18',
    'TypeScript',
    'Tailwind CSS',
    'Vite',
    'Chrome Extension Manifest V3',
    'Zustand',
    'IndexedDB',
  ],
  github: 'https://github.com/your-username/videograbber-pro',
  downloadUrl: 'https://github.com/your-username/videograbber-pro/releases',
};

// ============================================================
// 读取 manifest.json
// ============================================================

function readManifest() {
  const manifestPath = join(projectDir, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return {
    version: manifest.version,
    description: manifest.description,
    name: manifest.name,
  };
}

// ============================================================
// 模板 A: GitHub/Reddit 极客风
// ============================================================

function generateGeekPromo(manifest) {
  const date = new Date().toISOString().split('T')[0];
  
  return `# ${CONFIG.productName} v${manifest.version}

> 🎬 A privacy-focused, open-source video downloader Chrome extension

## ✨ Features

- **Smart Detection** - Automatically detects videos on web pages
- **Multi-Quality** - Download in 360p, 720p, 1080p, or 4K
- **Resume Downloads** - Continue interrupted downloads
- **Multi-threaded** - Accelerated downloading with chunked transfers
- **Privacy First** - All processing happens locally, no data collection
- **Modern UI** - Clean dark theme with React + Tailwind CSS

## 🛠️ Tech Stack

\`\`\`
${CONFIG.techStack.join(' | ')}
\`\`\`

## 📦 Installation

### From Release
1. Download \`HBSY_VideoGrabber_Pro_v${manifest.version}_Install.zip\` from [Releases](${CONFIG.downloadUrl})
2. Extract the ZIP file
3. Open Chrome → \`chrome://extensions/\`
4. Enable "Developer mode"
5. Click "Load unpacked" → Select extracted folder

### From Source
\`\`\`bash
git clone ${CONFIG.github}
cd videograbber-pro
npm install
npm run build
# Load the \`dist\` folder in Chrome
\`\`\`

## 🔒 Privacy

- ✅ No data collection
- ✅ No analytics
- ✅ No external requests (except video downloads)
- ✅ All processing happens locally
- ✅ Open source - audit the code yourself

## ⚠️ Disclaimer

This extension is for personal use only. Please respect copyright laws and the terms of service of websites you visit. The extension does not support downloading from DRM-protected platforms (YouTube, Netflix, etc.).

## 📄 License

MIT License - Free to use, modify, and distribute.

---

**Version:** ${manifest.version} | **Updated:** ${date}

[⬇️ Download](${CONFIG.downloadUrl}) | [📖 Documentation](${CONFIG.github}#readme) | [🐛 Report Bug](${CONFIG.github}/issues)
`;
}

// ============================================================
// 模板 B: 国内论坛亲民风
// ============================================================

function generateCNForumPromo(manifest) {
  return `# 【神器分享】${CONFIG.productNameCN} v${manifest.version} - 永久免费的视频下载扩展！

---

## 🎉 软件介绍

各位坛友好！今天给大家分享一款**完全免费、无广告**的 Chrome 视频下载扩展。

**软件名称：** ${CONFIG.productNameCN}
**当前版本：** v${manifest.version}
**软件大小：** ~70KB
**适用平台：** Chrome / Edge / Brave 浏览器

---

## ✨ 主要功能

${CONFIG.featuresCN.join('\n')}

---

## 🌐 支持网站

目前测试支持以下网站的视频下载：

${CONFIG.supportedSites.map(s => `✅ ${s}`).join('\n')}

> ⚠️ **注意：** 由于版权保护，不支持爱奇艺、优酷、腾讯视频、B站等主流平台（这些平台使用了加密技术）

---

## 📥 下载地址

**GitHub Release：** ${CONFIG.downloadUrl}

下载 \`HBSY_VideoGrabber_Pro_v${manifest.version}_Install.zip\` 即可

---

## 📦 安装教程

1. 下载上面的 ZIP 文件并**解压**
2. 打开 Chrome 浏览器，地址栏输入 \`chrome://extensions/\`
3. 打开右上角的「**开发者模式**」
4. 点击「**加载已解压的扩展程序**」
5. 选择刚才解压的文件夹
6. 完成！去有视频的网页试试吧~

---

## 🖼️ 软件截图

[截图位置 - 请自行添加]

---

## 💬 使用反馈

用得好的话帮忙点个赞👍，有问题可以回帖反馈~

---

## 🔒 安全说明

- ✅ 本软件**完全免费**，不存在任何收费项目
- ✅ **无广告**，纯净体验
- ✅ **不收集**任何用户数据
- ✅ 所有操作都在**本地完成**
- ✅ 开源软件，代码公开透明

---

**最后更新：** ${new Date().toLocaleDateString('zh-CN')}
**作者：** 户部尚赢

> 如果觉得好用，欢迎分享给更多人！
`;
}


// ============================================================
// 模板 C: 通用下载站官方风
// ============================================================

function generateOfficialPromo(manifest) {
  return `# ${CONFIG.productName}

**版本：** v${manifest.version}  
**更新日期：** ${new Date().toLocaleDateString('zh-CN')}  
**文件大小：** ~70 KB  
**系统要求：** Chrome 88+ / Edge 88+ / Brave 1.20+  
**授权方式：** 免费软件  

---

## 软件简介

${CONFIG.productName}（${CONFIG.productNameCN}）是一款专业的浏览器视频下载扩展程序。采用先进的视频检测技术，支持多种视频格式和清晰度选择，提供断点续传和多线程加速功能，让视频下载更加便捷高效。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 智能检测 | 自动识别网页中的视频资源 |
| 多清晰度 | 支持 360p、480p、720p、1080p、4K |
| 断点续传 | 下载中断后可继续下载 |
| 多线程下载 | 分片并行下载，提升速度 |
| 现代界面 | 深色主题，简洁美观 |
| 隐私保护 | 本地处理，不上传数据 |

---

## 安装说明

### 方式一：手动安装

1. 下载安装包 \`HBSY_VideoGrabber_Pro_v${manifest.version}_Install.zip\`
2. 解压到任意目录
3. 打开 Chrome 浏览器，访问 \`chrome://extensions/\`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的文件夹

### 方式二：Chrome 商店（审核中）

即将上架 Chrome Web Store，敬请期待。

---

## 使用说明

1. 访问包含视频的网页
2. 点击浏览器工具栏中的扩展图标
3. 扩展会自动检测页面中的视频
4. 选择需要的清晰度
5. 点击下载按钮开始下载

---

## 支持格式

- MP4
- WebM
- M4V
- 其他 HTML5 视频格式

---

## 注意事项

1. 本软件仅供个人学习研究使用
2. 请尊重版权，勿用于商业用途
3. 部分网站因版权保护无法下载（如 YouTube、Netflix 等）
4. 下载的视频请在 24 小时内删除

---

## 更新日志

### v${manifest.version}
- 首个正式版本发布
- 支持智能视频检测
- 支持多清晰度选择
- 支持断点续传
- 支持多线程下载

---

## 技术支持

- **问题反馈：** ${CONFIG.github}/issues
- **项目主页：** ${CONFIG.github}

---

© ${new Date().getFullYear()} ${CONFIG.productName}. All rights reserved.
`;
}

// ============================================================
// AI 生成文案 (可选)
// ============================================================

async function generateWithAI(manifest, style) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  未设置 OPENAI_API_KEY，使用模板生成');
    return null;
  }
  
  const stylePrompts = {
    geek: `Generate a GitHub/Reddit style promotional text for a Chrome extension. 
           Style: Technical, geeky, emphasize open-source, privacy, tech stack.
           Language: English`,
    forum: `为一个 Chrome 视频下载扩展生成国内论坛风格的推广文案。
            风格：亲民、接地气，强调"永久免费"、"无广告"、"支持XX网站"。
            语言：中文`,
    official: `为一个 Chrome 视频下载扩展生成正式的软件介绍文案。
               风格：官方、专业、正式。
               语言：中文`,
  };
  
  const prompt = `${stylePrompts[style]}

Product Info:
- Name: ${CONFIG.productName} (${CONFIG.productNameCN})
- Version: ${manifest.version}
- Description: ${manifest.description}
- Features: ${CONFIG.features.join(', ')}
- Tech Stack: ${CONFIG.techStack.join(', ')}

Please generate a complete promotional markdown document.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional copywriter for software products.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.log(`⚠️  AI 生成失败: ${error.message}`);
    return null;
  }
}

// ============================================================
// 主函数
// ============================================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('📝 HBSY VideoGrabber Pro - 推广文案生成器');
  console.log('='.repeat(60) + '\n');
  
  // 读取 manifest
  const manifest = readManifest();
  console.log(`📦 版本: v${manifest.version}`);
  console.log(`📄 描述: ${manifest.description}\n`);
  
  // 创建输出目录
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const useAI = process.argv.includes('--ai');
  
  if (useAI) {
    console.log('🤖 使用 AI 生成模式\n');
  } else {
    console.log('📋 使用模板生成模式 (添加 --ai 参数启用 AI 生成)\n');
  }
  
  // 生成文案
  const promos = [
    {
      name: 'promo_github_reddit.md',
      title: 'GitHub/Reddit 极客风',
      style: 'geek',
      generator: generateGeekPromo,
    },
    {
      name: 'promo_cn_forum.md',
      title: '国内论坛亲民风',
      style: 'forum',
      generator: generateCNForumPromo,
    },
    {
      name: 'promo_official.md',
      title: '通用下载站官方风',
      style: 'official',
      generator: generateOfficialPromo,
    },
  ];
  
  for (const promo of promos) {
    console.log(`📝 生成: ${promo.title}...`);
    
    let content;
    
    if (useAI) {
      content = await generateWithAI(manifest, promo.style);
    }
    
    if (!content) {
      content = promo.generator(manifest);
    }
    
    const outputPath = join(outputDir, promo.name);
    writeFileSync(outputPath, content, 'utf-8');
    console.log(`   ✅ 已保存: ${outputPath}`);
  }
  
  // 打印摘要
  console.log('\n' + '='.repeat(60));
  console.log('🎉 文案生成完成!');
  console.log('='.repeat(60));
  console.log(`\n📂 输出目录: ${outputDir}`);
  console.log('\n📋 生成的文件:');
  promos.forEach(p => {
    console.log(`   • ${p.name} - ${p.title}`);
  });
  console.log('\n💡 提示: 打开文件复制内容，粘贴到对应平台发布');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
