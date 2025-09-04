import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";
// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 必须设置成 false，才能在 Composition API 中使用
  locale: "zh-CN", // 设置默认语言
  fallbackLocale: "en", // 如果中文翻译不存在，就回退到英文
  messages: {
    en: en,
    "zh-CN": zhCN,
  },
});
export default i18n;
