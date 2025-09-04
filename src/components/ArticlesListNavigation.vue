<template>
  <div class="articles-toggle">
    <ul class="nav nav-pills outline-active">
      <!-- 1. 循环渲染我们最终计算出来的 `links` 数组。 -->
      <li v-for="link in links" :key="link.name" class="nav-item">
        <!-- 2. AppLink 是一个自定义的 router-link 封装。 -->
        <!--    它比普通的 <router-link> 更智能或样式更统一。 -->
        <AppLink
          class="nav-link"
          active-class="active"
          :name="link.routeName"
          :params="link.routeParams"
        >
          <!-- 3. 如果链接有 icon，就渲染一个 <i> 标签。 -->
          <i v-if="link.icon" :class="link.icon" />
          <!-- 4. 显示链接的标题 -->
          {{ link.title }}
        </AppLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import type { RouteParams } from "vue-router";
import { storeToRefs } from "pinia";
import type { ArticlesType } from "src/composable/useArticles";
import type { AppRouteNames } from "src/router/routes";
import { useUserStore } from "src/store/user";

const { t } = useI18n();

// 定义一个接口，描述导航链接对象的数据结构
interface ArticlesListNavLink {
  name: ArticlesType;
  routeName: AppRouteNames;
  routeParams?: Partial<RouteParams>;
  title: string;
  icon?: string;
}

// 定义组件接收的 props
interface Props {
  useGlobalFeed?: boolean;
  useMyFeed?: boolean;
  useTagFeed?: boolean;
  useUserFeed?: boolean;
  useUserFavorited?: boolean;
  tag: string;
  username: string;
}

// 使用 withDefaults 给 props 设置默认值。
const props = withDefaults(defineProps<Props>(), {
  useGlobalFeed: false,
  useMyFeed: false,
  useTagFeed: false,
  useUserFavorited: false,
  useUserFeed: false,
});

// 核心逻辑 A：创建一个计算属性 `allLinks`。
const allLinks = computed<ArticlesListNavLink[]>(() => [
  {
    name: "global-feed",
    routeName: "global-feed",
    title: t("navigation.globalFeed"),
  },
  {
    name: "my-feed",
    routeName: "my-feed",
    title: t("navigation.myFeed"),
  },
  {
    name: "tag-feed",
    routeName: "tag",
    routeParams: { tag: props.tag },
    title: t("navigation.tagFeed", { tag: props.tag }),
    icon: "ion-pound",
  },
  {
    name: "user-feed",
    routeName: "profile",
    routeParams: { username: props.username },
    title: t("navigation.myArticles"),
  },
  {
    name: "user-favorites-feed",
    routeName: "profile-favorites",
    routeParams: { username: props.username },
    title: t("navigation.favoritedArticles"),
  },
]);

// 从 userStore 中解构出 isAuthorized getter，并用 storeToRefs 保持其响应性。
const { isAuthorized } = storeToRefs(useUserStore());

// 核心逻辑 B：创建一个计算属性 `show`。
//     这是一个“显示规则”映射表。它根据 props 和用户登录状态，
//     来决定【每一种】链接类型是否应该被显示。
const show = computed<Record<ArticlesType, boolean>>(() => ({
  "global-feed": props.useGlobalFeed,
  "my-feed": props.useMyFeed && isAuthorized.value,
  "tag-feed": props.useTagFeed && props.tag !== "",
  "user-feed": props.useUserFeed && props.username !== "",
  "user-favorites-feed": props.useUserFavorited && props.username !== "",
}));

//  核心逻辑 C：最终要渲染的链接 `links`。
const links = computed<ArticlesListNavLink[]>(() =>
  allLinks.value.filter((link) => show.value[link.name])
);
</script>
