<template>
  <!-- 1. 导航栏主体：白色背景，底部有柔和的阴影和边框 -->
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <!-- 2. 内容容器：限制最大宽度并居中，使用 flex 实现内部元素两端对齐 -->
    <div class="container mx-auto flex items-center justify-between p-4">
      <!-- 3. 品牌 Logo/链接：使用醒目的颜色和更大的字号 -->
      <AppLink class="text-sky-500 text-2xl font-bold" name="global-feed">
        {{ t("global.conduit") }}
      </AppLink>
      距
      <!-- 4. 导航链接列表：使用 flex 布局，并为各项之间添加间-->
      <ul class="flex items-center space-x-2 md:space-x-4">
        <!-- 导航链接 -->
        <li v-for="link in navLinks" :key="link.name">
          <!-- 5. 单个导航链接：
               - 基础样式：灰色文字，提供内边距以扩大点击区域
               - 交互样式：鼠标悬停时文字颜色加深
               - 过渡效果：让颜色变化更平滑
          -->
          <AppLink
            class="flex items-center px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors duration-300"
            :name="link.name"
            :params="link.params"
            :aria-label="link.title"
          >
            <i v-if="link.icon" :class="[link.icon, 'mr-1.5']" />
            {{ link.title }}
          </AppLink>
        </li>

        <!-- 语言切换按钮 -->
        <li>
          <LanguageSwitcher />
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteParams } from "vue-router";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import type { AppRouteNames } from "src/router/routes";
import { useUserStore } from "src/store/user";

import LanguageSwitcher from "./LanguageSwitcher.vue";

const { t } = useI18n();

interface NavLink {
  name: AppRouteNames;
  params?: Partial<RouteParams>;
  title: string;
  icon?: string;
  display: "all" | "anonym" | "authorized"; // 什么时候展示 全部 / 未登录 / 已登录
}

const { user } = storeToRefs(useUserStore());

const username = computed(() => user.value?.username);
const displayStatus = computed(() =>
  username.value ? "authorized" : "anonym"
);

const allNavLinks = computed<NavLink[]>(() => [
  {
    name: "global-feed",
    title: t("header.home"),
    display: "all",
  },
  {
    name: "login",
    title: t("header.signIn"),
    display: "anonym",
  },
  {
    name: "register",
    title: t("header.signUp"),
    display: "anonym",
  },
  {
    name: "create-article",
    title: t("header.newPost"),
    display: "authorized",
    icon: "ion-compose",
  },
  {
    name: "settings",
    title: t("header.settings"),
    display: "authorized",
    icon: "ion-gear-a",
  },
  {
    name: "profile",
    params: { username: username.value },
    title: username.value || "",
    display: "authorized",
  },
]);

const navLinks = computed(() =>
  allNavLinks.value.filter(
    (l) => l.display === displayStatus.value || l.display === "all"
  )
);
</script>
