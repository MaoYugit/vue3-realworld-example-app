<template>
  <nav class="navbar navbar-light">
    <div class="container">
      <AppLink class="navbar-brand" name="global-feed"> 知渠 </AppLink>

      <ul class="nav navbar-nav pull-xs-right">
        <li v-for="link in navLinks" :key="link.name" class="nav-item">
          <AppLink
            class="nav-link"
            active-class="active"
            :name="link.name"
            :params="link.params"
            :aria-label="link.title"
          >
            <i v-if="link.icon" :class="link.icon" />
            {{ link.title }}
          </AppLink>
        </li>
        <li class="nav-item">
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
  display: "all" | "anonym" | "authorized";
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
