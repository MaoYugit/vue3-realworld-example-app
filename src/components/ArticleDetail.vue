<template>
  <div class="banner">
    <div class="container">
      <h1>{{ article.title }}</h1>

      <ArticleDetailMeta
        v-if="article"
        :article="article"
        @update="updateArticle"
      />
    </div>
  </div>

  <div class="container page">
    <div class="row article-content">
      <!-- eslint-disable vue/no-v-html -->
      <!-- v-html 现在绑定到一个 ref，它将包含解析后的 HTML 字符串 -->
      <div id="article-content" class="col-md-12" v-html="articleHandledBody" />
      <!-- eslint-enable vue/no-v-html -->

      <!-- TODO: abstract tag list component -->
      <ul class="tag-list">
        <li
          v-for="tag in article.tagList"
          :key="tag"
          class="tag-default tag-pill tag-outline"
        >
          {{ tag }}
        </li>
      </ul>
    </div>

    <hr />

    <div class="article-actions">
      <ArticleDetailMeta
        v-if="article"
        :article="article"
        @update="updateArticle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. 从 'vue' 中导入 ref 和 watch
import { reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import marked from "src/plugins/marked";
import { api } from "src/services";
import type { Article } from "src/services/api";
import ArticleDetailMeta from "./ArticleDetailMeta.vue";

const route = useRoute();
const slug = route.params.slug as string;
const article: Article = reactive(
  await api.articles.getArticle(slug).then((res) => res.data.article)
);

// 2. 创建一个 ref 来存储解析后的 HTML，初始值为空字符串
const articleHandledBody = ref("");

// 3. 使用 watch 来监听 article.body 的变化
watch(
  () => article.body, // Source: 我们要监听的数据源
  async (newBody) => {
    // Callback: 当数据源变化时执行的回调
    if (newBody) {
      // 4. 在回调中 await 异步的 marked 函数，并将结果赋值给 ref 的 .value
      articleHandledBody.value = await marked(newBody);
    }
  },
  { immediate: true } // Option: 立即执行一次回调，以便在组件首次加载时就解析内容
);

function updateArticle(newArticle: Article) {
  Object.assign(article, newArticle);
}
</script>
