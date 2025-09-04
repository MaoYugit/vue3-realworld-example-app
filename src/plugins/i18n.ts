import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";

// 1. 从 localStorage 读取已保存的语言，如果没有，默认使用 'zh-CN'
const savedLocale = (localStorage.getItem("locale") || "zh-CN") as Locale;
export type Locale = "zh-CN" | "en";

// 2. 创建 i18n 实例
export const i18n = createI18n({
  // <--- 把 i18n 实例 export 出去
  legacy: false,
  locale: savedLocale, // <-- 使用读取到的语言
  fallbackLocale: "en",
  messages: {
    en: en,
    "zh-CN": zhCN,
  },
});

// 3. 定义一个语言列表，方便 UI 组件使用
export const availableLocales = [
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" },
];

// 4. 封装一个切换语言的函数
export function setLocale(locale: Locale) {
  // a. 修改 i18n 实例的 locale
  i18n.global.locale.value = locale;
  // b. 把用户的选择保存到 localStorage，以便下次访问时记住
  localStorage.setItem("locale", locale);
}
