<template>
  <div class="home-page">
    <div class="banner">
      <div class="container">
        <h1 class="logo-font">
          <!-- conduit -->
          知渠
        </h1>
        <p>
          <!-- A place to share your knowledge. -->
          一个分享你知识的地方
        </p>
      </div>
    </div>

    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <Suspense>
            <ArticlesList use-global-feed use-my-feed use-tag-feed />
            <template #fallback>
              <!-- Articles are downloading...  -->
              文章正在加载当中......
            </template>
          </Suspense>
        </div>

        <div class="col-md-3">
          <div class="sidebar">
            <Suspense>
              <PopularTags />
              <template #fallback>
                <!-- Popular tags are downloading...  -->
                热门标签正在加载当中......
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
</script>
