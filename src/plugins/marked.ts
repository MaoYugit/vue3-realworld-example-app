/* eslint-disable antfu/consistent-list-newline */
import DOMPurify from "dompurify";
import { marked } from "marked";

// <-- 改动 1: 在函数前加上 async，并修改返回类型为 Promise<string>
export default async (markdown?: string): Promise<string> => {
  if (!markdown) return "";

  // <-- 改动 2: 在 marked 调用前加上 await，等待它完成
  const html = await marked(markdown);

  // 现在，html 变量就是一个真正的字符串了，TypeScript 不再报错
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "article",
      "b",
      "blockquote",
      "br",
      "caption",
      "code",
      "del",
      "details",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "i",
      "img",
      "input",
      "ins",
      "kbd",
      "li",
      "main",
      "ol",
      "p",
      "pre",
      "section",
      "span",
      "strike",
      "strong",
      "sub",
      "summary",
      "sup",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "u",
      "ul",
    ],
    ALLOWED_ATTR: [
      "href",
      "name",
      "target",
      "title",
      "allowfullscreen",
      "frameborder",
      "src",
      "alt",
      "class",
      "id",
      "start",
      "align",
      "rowspan",
      "disabled",
      "type",
      "checked",
    ],
  });

  return cleanHtml;
};
