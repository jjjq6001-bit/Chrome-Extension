/**
 * 国际化工具函数
 * 根据浏览器语言自动选择中文或英文界面
 */

/**
 * 获取国际化消息
 * @param key 消息键名
 * @param substitutions 替换参数
 * @returns 翻译后的文本
 */
export function getMessage(key: string, substitutions?: string | string[]): string {
  try {
    const message = chrome.i18n.getMessage(key, substitutions);
    return message || key;
  } catch {
    return key;
  }
}

/**
 * 获取当前语言
 * @returns 当前语言代码 (如 'zh_CN', 'en')
 */
export function getCurrentLocale(): string {
  return chrome.i18n.getUILanguage();
}

/**
 * 判断当前是否为中文环境
 * @returns 是否为中文
 */
export function isChinese(): boolean {
  const locale = getCurrentLocale();
  return locale.startsWith('zh');
}

/**
 * 判断当前是否为英文环境
 * @returns 是否为英文
 */
export function isEnglish(): boolean {
  const locale = getCurrentLocale();
  return locale.startsWith('en');
}

/**
 * 初始化页面国际化
 * 自动替换带有 data-i18n 属性的元素文本
 */
export function initI18n(): void {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const message = getMessage(key);
      if (message) {
        element.textContent = message;
      }
    }
  });

  // 处理带有 data-i18n-placeholder 属性的输入框
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      const message = getMessage(key);
      if (message) {
        element.placeholder = message;
      }
    }
  });

  // 处理带有 data-i18n-title 属性的元素（tooltip）
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key && element instanceof HTMLElement) {
      const message = getMessage(key);
      if (message) {
        element.title = message;
      }
    }
  });
}

/**
 * React Hook: 获取国际化消息
 */
export function useI18n() {
  return {
    t: getMessage,
    locale: getCurrentLocale(),
    isChinese: isChinese(),
    isEnglish: isEnglish(),
  };
}

// 导出常用消息的快捷方法
export const i18n = {
  appName: () => getMessage('appName'),
  appDesc: () => getMessage('appDesc'),
  appTitle: () => getMessage('appTitle'),
  tabVideos: () => getMessage('tabVideos'),
  tabDownloads: () => getMessage('tabDownloads'),
  refresh: () => getMessage('refresh'),
  settings: () => getMessage('settings'),
  detecting: () => getMessage('detecting'),
  noVideos: () => getMessage('noVideos'),
  noVideosHint: () => getMessage('noVideosHint'),
  videosFound: (count: number) => getMessage('videosFound', [count.toString()]),
  noDownloads: () => getMessage('noDownloads'),
  statusPending: () => getMessage('statusPending'),
  statusDownloading: () => getMessage('statusDownloading'),
  statusPaused: () => getMessage('statusPaused'),
  statusCompleted: () => getMessage('statusCompleted'),
  statusError: () => getMessage('statusError'),
  footerText: (version: string, count: number) => getMessage('footerText', [version, count.toString()]),
};

export default i18n;
