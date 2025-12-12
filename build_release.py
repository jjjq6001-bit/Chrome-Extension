#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HBSY VideoGrabber Pro - 自动化打包发布脚本
用于生成发布包和更新日志

功能：
1. 读取 manifest.json 中的版本号
2. 生成源码包和安装包
3. 生成中英文更新日志模板

兼容 Windows 和 Mac/Linux
"""

import json
import os
import shutil
import zipfile
from datetime import datetime
from pathlib import Path


# 配置
PROJECT_NAME = "HBSY_VideoGrabber_Pro"
DIST_FOLDER = "dist"
RELEASE_FOLDER = "release"

# 源码包排除的文件和文件夹
SOURCE_EXCLUDES = [
    ".git",
    ".gitignore",
    ".vscode",
    ".idea",
    "node_modules",
    "dist",
    "release",
    ".DS_Store",
    "Thumbs.db",
    "*.log",
    "*.zip",
    "__pycache__",
    ".env",
    ".env.local",
]

# 安装包需要包含的文件（从 dist 目录）
INSTALL_INCLUDES = [
    "manifest.json",
    "assets",
    "public",
    "src",
    "_locales",
    "service-worker-loader.js",
]


def get_script_dir() -> Path:
    """获取脚本所在目录"""
    return Path(__file__).parent.resolve()


def read_manifest_version(project_dir: Path) -> str:
    """读取 manifest.json 中的版本号"""
    manifest_path = project_dir / "manifest.json"
    
    if not manifest_path.exists():
        raise FileNotFoundError(f"找不到 manifest.json: {manifest_path}")
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    version = manifest.get("version", "1.0.0")
    print(f"📦 读取版本号: v{version}")
    return version


def should_exclude(path: Path, excludes: list) -> bool:
    """检查路径是否应该被排除"""
    path_str = str(path)
    name = path.name
    
    for exclude in excludes:
        if exclude.startswith("*"):
            # 通配符匹配（如 *.log）
            if name.endswith(exclude[1:]):
                return True
        elif name == exclude or exclude in path_str:
            return True
    
    return False


def create_source_zip(project_dir: Path, release_dir: Path, version: str) -> Path:
    """创建源码包（排除开发文件）"""
    zip_name = f"{PROJECT_NAME}_v{version}_Source.zip"
    zip_path = release_dir / zip_name
    
    print(f"📁 创建源码包: {zip_name}")
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(project_dir):
            # 过滤掉需要排除的目录
            dirs[:] = [d for d in dirs if not should_exclude(Path(root) / d, SOURCE_EXCLUDES)]
            
            for file in files:
                file_path = Path(root) / file
                
                # 检查是否应该排除
                if should_exclude(file_path, SOURCE_EXCLUDES):
                    continue
                
                # 计算相对路径
                rel_path = file_path.relative_to(project_dir)
                
                # 添加到 ZIP（使用项目名作为根目录）
                arc_name = f"{PROJECT_NAME}_v{version}_Source/{rel_path}"
                zf.write(file_path, arc_name)
    
    print(f"   ✅ 源码包创建完成: {zip_path}")
    return zip_path


def create_install_zip(project_dir: Path, release_dir: Path, version: str) -> Path:
    """创建安装包（从 dist 目录）"""
    zip_name = f"{PROJECT_NAME}_v{version}_Install.zip"
    zip_path = release_dir / zip_name
    dist_dir = project_dir / DIST_FOLDER
    
    if not dist_dir.exists():
        raise FileNotFoundError(f"找不到 dist 目录，请先运行 npm run build: {dist_dir}")
    
    print(f"📦 创建安装包: {zip_name}")
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dist_dir):
            # 排除 .vite 目录
            dirs[:] = [d for d in dirs if d != ".vite"]
            
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(dist_dir)
                
                # 添加到 ZIP
                zf.write(file_path, str(rel_path))
    
    print(f"   ✅ 安装包创建完成: {zip_path}")
    return zip_path


def create_release_notes(release_dir: Path, version: str) -> tuple:
    """创建中英文更新日志模板"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 中文更新日志
    zh_content = f"""# HBSY VideoGrabber Pro v{version} 更新日志

发布日期: {today}

## 下载文件
- 安装包: HBSY_VideoGrabber_Pro_v{version}_Install.zip
- 源码包: HBSY_VideoGrabber_Pro_v{version}_Source.zip

## 更新内容

### 新功能
- [请在此处填写新功能]

### 优化
- [请在此处填写优化内容]

### 修复
- [请在此处填写修复的问题]

## 安装说明
1. 下载 Install.zip 并解压
2. 打开 Chrome 浏览器，访问 chrome://extensions/
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择解压后的文件夹

## 系统要求
- Chrome 88+ / Edge 88+ / Brave 1.20+
- Windows 7+ / macOS 10.12+ / Linux

---
HBSY智能视频下载 - 专业的视频下载扩展
"""
    
    # 英文更新日志
    en_content = f"""# HBSY VideoGrabber Pro v{version} Release Notes

Release Date: {today}

## Download Files
- Install Package: HBSY_VideoGrabber_Pro_v{version}_Install.zip
- Source Code: HBSY_VideoGrabber_Pro_v{version}_Source.zip

## What's New

### New Features
- [Add new features here]

### Improvements
- [Add improvements here]

### Bug Fixes
- [Add bug fixes here]

## Installation
1. Download and extract Install.zip
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extracted folder

## System Requirements
- Chrome 88+ / Edge 88+ / Brave 1.20+
- Windows 7+ / macOS 10.12+ / Linux

---
HBSY VideoGrabber Pro - Professional Video Downloader Extension
"""
    
    zh_path = release_dir / "release_note_zh.txt"
    en_path = release_dir / "release_note_en.txt"
    
    print("📝 创建更新日志...")
    
    with open(zh_path, "w", encoding="utf-8") as f:
        f.write(zh_content)
    print(f"   ✅ 中文更新日志: {zh_path}")
    
    with open(en_path, "w", encoding="utf-8") as f:
        f.write(en_content)
    print(f"   ✅ 英文更新日志: {en_path}")
    
    return zh_path, en_path


def print_summary(release_dir: Path, files: dict):
    """打印生成文件摘要"""
    print("\n" + "=" * 60)
    print("🎉 发布文件生成完成!")
    print("=" * 60)
    print(f"\n📂 输出目录: {release_dir.resolve()}")
    print("\n📋 生成的文件:")
    
    for name, path in files.items():
        if path.exists():
            size = path.stat().st_size
            if size > 1024 * 1024:
                size_str = f"{size / 1024 / 1024:.2f} MB"
            elif size > 1024:
                size_str = f"{size / 1024:.2f} KB"
            else:
                size_str = f"{size} B"
            print(f"   • {path.name} ({size_str})")
    
    print("\n💡 下一步:")
    print("   1. 编辑 release_note_zh.txt 和 release_note_en.txt 填写更新内容")
    print("   2. 上传 Install.zip 到 Chrome Web Store")
    print("   3. 上传到其他分发渠道")
    print("=" * 60)


def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("🚀 HBSY VideoGrabber Pro - 自动化打包发布")
    print("=" * 60 + "\n")
    
    try:
        # 获取项目目录
        project_dir = get_script_dir()
        print(f"📁 项目目录: {project_dir}")
        
        # 读取版本号
        version = read_manifest_version(project_dir)
        
        # 创建 release 目录
        release_dir = project_dir / RELEASE_FOLDER
        if release_dir.exists():
            shutil.rmtree(release_dir)
        release_dir.mkdir(parents=True, exist_ok=True)
        print(f"📂 创建发布目录: {release_dir}")
        
        # 生成文件
        files = {}
        
        # 创建源码包
        files["source"] = create_source_zip(project_dir, release_dir, version)
        
        # 创建安装包
        files["install"] = create_install_zip(project_dir, release_dir, version)
        
        # 创建更新日志
        zh_note, en_note = create_release_notes(release_dir, version)
        files["note_zh"] = zh_note
        files["note_en"] = en_note
        
        # 打印摘要
        print_summary(release_dir, files)
        
        return 0
        
    except FileNotFoundError as e:
        print(f"\n❌ 错误: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
