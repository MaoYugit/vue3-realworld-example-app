<template>
  <!-- 1. 导航栏组件 -->
  <ArticlesListNavigation v-bind="$attrs" :tag="tag" :username="username" />

  <!-- 2. 加载状态的 UI -->
  <div v-if="articlesDownloading" class="article-preview">
    <!-- Articles are downloading... -->
    文章正在加载当中......
  </div>
  <!-- 3. 空状态的 UI -->
  <div v-else-if="articles.length === 0" class="article-preview">
    <!-- No articles are here... yet. -->
    这一部分当前没有文章
  </div>
  <!-- 4. 正常渲染文章列表 -->
  <template v-else>
    <!-- 4. 正常渲染文章列表 -->
    <ArticlesListArticlePreview
      v-for="(article, index) in articles"
      :key="article.slug"
      :article="article"
      @update="(newArticle) => updateArticle(index, newArticle)"
    />

    <!-- 6. 分页组件 -->
    <AppPagination
      :count="articlesCount"
      :page="page"
      @page-change="changePage"
    />
  </template>
</template>

<script setup lang="ts">
// 动态数据的来源
import { useArticles } from "src/composable/useArticles";
// 底部的分页器
import AppPagination from "./AppPagination.vue";
// 列表中每一篇文章的预览卡片
import ArticlesListArticlePreview from "./ArticlesListArticlePreview.vue";
// 列表顶部的导航栏
import ArticlesListNavigation from "./ArticlesListNavigation.vue";

// 核心逻辑：执行 useArticles() 并解构出所有需要用到的状态和方法。
const {
  articlesDownloading, // 一个布尔值 ref，表示是否正在加载文章
  articlesCount, // 一个数字 ref，表示文章总数
  articles, // 一个数组 ref，存放当前页的文章列表
  page, // 一个数字 ref，表示当前页码
  tag, // 一个字符串 ref，表示当前激活的标签
  username, // 一个字符串 ref，表示当前查看的作者
  fetchArticles, // 一个函数，调用它会触发 API 请求来获取文章
  updateArticle, // 一个函数，用于局部更新单篇文章
  changePage, // 一个函数，用于改变当前页码
} = useArticles();

// Top-level await: 在组件 setup 阶段直接等待一个异步操作。
//    这会“暂停”组件的渲染，直到 fetchArticles() 完成。
//    这个行为会被父组件中的 <Suspense> 捕获，从而显示 fallback 内容。
//    【现代化思考】：虽然 Suspense 很酷，但它目前在 Vue 中仍被标记为实验性特性。
//    在很多生产项目中，开发者更倾向于使用传统的 v-if="isLoading" 模式，因为它更稳定，
//    且对错误处理（比如 API 请求失败）的控制更直接。
await fetchArticles();
</script>
