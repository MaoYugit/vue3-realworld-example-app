/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // 扫描根目录的 HTML 文件
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 扫描 src 目录下所有子文件夹里的 .vue, .js 等文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
