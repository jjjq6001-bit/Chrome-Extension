# HBSY VideoGrabber Pro - 户部尚赢智能视频下载

> 英文名称：HBSY VideoGrabber Pro  
> 中文名称：户部尚赢智能视频下载

一款解决现有视频下载扩展痛点的 Chrome 扩展，提供美观界面、多格式支持、断点续传等专业功能。

## 核心特性

- 🎯 智能视频检测 - 自动识别页面中的视频资源
- 🎨 现代化 UI - 简洁美观的界面设计
- 📊 多清晰度选择 - 支持 360p/480p/720p/1080p/4K
- 🔄 断点续传 - 大文件下载中断可恢复
- ⚡ 多线程下载 - 加速下载体验
- 📁 格式转换 - 支持 MP4/WebM/MP3 等格式
- 🚫 无需注册 - 开箱即用，无隐私收集

## 快速开始

### 开发模式
```bash
cd VideoGrabber
npm install
npm run build
```

### 安装扩展
1. 在 Chrome 中打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `VideoGrabber/dist` 文件夹

## 技术栈

- Manifest V3
- TypeScript
- React 18
- Tailwind CSS
- Zustand (状态管理)
- Vite (构建工具)
- Chrome Extensions API

## 项目文档

- [技术开发文档](docs/技术开发文档.md) - 详细的技术架构和设计文档
- [开发日志](docs/开发日志.md) - 每次开发任务的完成情况记录

## 项目结构

```
VideoGrabber/
├── dist/                 # 构建输出（加载此目录到 Chrome）
├── docs/                 # 项目文档
├── public/icons/         # 扩展图标
├── scripts/              # 构建脚本
├── src/
│   ├── background/       # Service Worker
│   ├── content/          # 视频检测脚本
│   ├── popup/            # React UI
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
└── manifest.json         # 扩展配置
```

## 开发进度

查看 [开发日志](docs/开发日志.md) 了解最新开发进度和待办事项。
