<template>
  <div class="home-page">
    <!-- 页眉 Banner 区域 -->
    <div class="bg-sky-500 text-white shadow-md py-12">
      <!-- 内容容器 -->
      <div class="container mx-auto text-center">
        <!-- 网站 Logo/标题 -->
        <h1 class="text-5xl font-bold mb-2 drop-shadow-md">
          <!-- conduit -->
          {{ t("global.conduit") }}
        </h1>
        <!-- 网站的 Slogan/口号 -->
        <p class="text-xl font-light">
          {{ t("global.slogan") }}
        </p>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="container mx-auto py-8">
      <!-- 行：class="row" 是一个布局类，表示这里面的内容要按“行”来组织。 -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧主内容区 在中等屏幕(md)及以上占 9/12  -->
        <div class="w-full lg:w-3/4">
          <!-- Suspense 异步组件边界 -->
          <Suspense>
            <!-- 默认内容：这里是最核心的文章列表组件。 -->
            <ArticlesList use-global-feed use-my-feed use-tag-feed />
            <!-- #fallback 插槽：这是 Suspense 的一部分。 -->
            <template #fallback>
              <div class="p-4 text-gray-500 italic">
                {{ t("article.loadingArticles") }}
              </div>
            </template>
          </Suspense>
        </div>

        <!-- 右侧边栏 (占 3/12) -->
        <div class="w-full lg:w-1/4">
          <!-- 侧边栏容器 -->
          <div class="bg-slate-100 p-4 rounded-lg">
            <!-- 同样使用 Suspense 来处理热门标签组件的异步加载。 -->
            <Suspense>
              <!-- 默认内容：热门标签组件。 -->
              <PopularTags />
              <!-- #fallback 插槽：在热门标签数据加载完成前显示的内容。 -->
              <template #fallback>
                <div class="text-gray-500 italic">
                  {{ t("article.loadingTags") }}
                </div>
              </template>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArticlesList from "src/components/ArticlesList.vue";
import PopularTags from "src/components/PopularTags.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
