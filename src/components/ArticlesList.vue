<template>
  <ArticlesListNavigation v-bind="$attrs" :tag="tag" :username="username" />

  <div v-if="articlesDownloading" class="article-preview">
    <!-- Articles are downloading... -->
    文章正在加载当中......
  </div>
  <div v-else-if="articles.length === 0" class="article-preview">
    <!-- No articles are here... yet. -->
    这一部分当前没有文章
  </div>
  <template v-else>
    <ArticlesListArticlePreview
      v-for="(article, index) in articles"
      :key="article.slug"
      :article="article"
      @update="(newArticle) => updateArticle(index, newArticle)"
    />

    <AppPagination
      :count="articlesCount"
      :page="page"
      @page-change="changePage"
    />
  </template>
</template>

<script setup lang="ts">
import { useArticles } from "src/composable/useArticles";
import AppPagination from "./AppPagination.vue";
import ArticlesListArticlePreview from "./ArticlesListArticlePreview.vue";
import ArticlesListNavigation from "./ArticlesListNavigation.vue";

const {
  fetchArticles,
  articlesDownloading,
  articlesCount,
  articles,
  updateArticle,
  page,
  changePage,
  tag,
  username,
} = useArticles();

await fetchArticles();
</script>
