<template>
  <div class="article-preview">
    <!-- 1. 文章元信息区域 (作者头像、名字、日期) -->
    <div class="article-meta">
      <!-- 作者头像链接 -->
      <AppLink
        name="profile"
        :params="{ username: props.article.author.username }"
      >
        <img :src="article.author.image" :alt="props.article.author.username" />
      </AppLink>
      <div class="info">
        <!-- 作者名字链接 -->
        <AppLink
          name="profile"
          :params="{ username: props.article.author.username }"
          class="author"
        >
          {{ article.author.username }}
        </AppLink>
        <!-- 发布日期，并格式化 -->
        <span class="date">{{
          new Date(article.createdAt).toDateString()
        }}</span>
      </div>

      <!-- 2. 点赞按钮 -->
      <!-- 3. 动态 Class：根据文章是否已点赞 (article.favorited)，切换按钮的样式。 -->
      <!--    'btn-primary' 是实心按钮，'btn-outline-primary' 是描边按钮。 -->
      <!-- 4. 动态禁用：把按钮的 disabled 状态，绑定到从 useFavoriteArticle 中获取的
             `favoriteProcessGoing` 状态。当点赞的 API 请求正在进行中时，按钮会被禁用，
             防止用户重复、快速地点击。 -->
      <!-- 5. 点击事件：当用户点击按钮时，调用从 useFavoriteArticle 中获取的
             `favoriteArticle` 函数，来启动整个点赞/取消点赞的流程。 -->
      <button
        :aria-label="
          article.favorited ? 'Unfavorite article' : 'Favorite article'
        "
        class="btn btn-sm pull-xs-right"
        :class="[article.favorited ? 'btn-primary' : 'btn-outline-primary']"
        :disabled="favoriteProcessGoing"
        @click="() => favoriteArticle()"
      >
        <i class="ion-heart" /> {{ article.favoritesCount }}
      </button>
    </div>

    <!-- 6. 文章主内容预览链接 -->
    <!--    整个标题、描述和标签列表，都被一个 <AppLink> 包裹， -->
    <!--    点击任何一个地方，都会跳转到文章的详情页。 -->
    <AppLink
      name="article"
      :params="{ slug: props.article.slug }"
      class="preview-link"
    >
      <h1>{{ article.title }}</h1>
      <p>{{ article.description }}</p>
      <span>{{ t("article.readMore") }}</span>
      <!-- 7. 标签列表 -->
      <ul class="tag-list">
        <li
          v-for="tag in article.tagList"
          :key="tag"
          class="tag-default tag-pill tag-outline"
        >
          {{ tag }}
        </li>
      </ul>
    </AppLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFavoriteArticle } from "src/composable/useFavoriteArticle";
import type { Article } from "src/services/api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
// 定义 Props 接口：规定父组件【必须】传递一个名为 `article` 的 prop，
//    它的类型必须是 `Article`。
interface Props {
  article: Article;
}

// 定义 Emits 接口：规定本组件【可能】会触发一个名为 `update` 的事件，
//    并且这个事件会携带一个 `Article` 对象作为数据。
interface Emits {
  (e: "update", article: Article): void;
}

// 使用 defineProps 和 defineEmits 宏来正式声明
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 核心逻辑：调用 useFavoriteArticle Composable 函数。
//    这个函数就像一个专门处理“点赞功能”的“外包专家”。
//    我们把完成工作所需要的所有“原材料”和“指令”，通过一个配置对象传递给它。
const { favoriteProcessGoing, favoriteArticle } = useFavoriteArticle({
  // 原材料 A：告诉专家，当前文章的“是否已点赞”状态是什么。
  // 我们用 computed 包装，这样当 props.article.favorited 变化时，专家能【响应式地】知道。
  isFavorited: computed(() => props.article.favorited),

  // 原材料 B：告诉专家，这篇文章的唯一标识 (slug) 是什么。
  articleSlug: computed(() => props.article.slug),

  // 指令 C：告诉专家，“当你完成了点赞/取消点赞操作，并从后端拿到了最新的文章数据后，
  //           请调用我提供给你的这个 `onUpdate` 函数。”
  // onUpdate 函数的逻辑很简单：直接调用 emit('update', newArticle)，
  // 把最新的文章数据“发射”给我的父组件（ArticlesList）
  onUpdate: (newArticle: Article): void => emit("update", newArticle),
});
</script>
