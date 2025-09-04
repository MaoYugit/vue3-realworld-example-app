// src/router/routes.ts

// 定义所有的路由数组 (用于分离)

import type { RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue"; // 确保路径正确

// 我们把路由名称的类型定义也放在这里，因为它和路由规则紧密相关
export type AppRouteNames =
  | "global-feed"
  | "my-feed"
  | "tag"
  | "article"
  | "create-article"
  | "edit-article"
  | "login"
  | "register"
  | "profile"
  | "profile-favorites"
  | "settings";

export const routes: RouteRecordRaw[] = [
  {
    name: "global-feed",
    path: "/",
    component: Home,
  },
  {
    name: "my-feed",
    path: "/my-feeds",
    component: Home,
  },
  {
    name: "tag",
    path: "/tag/:tag",
    component: Home,
  },
  {
    name: "article",
    path: "/article/:slug",
    component: () => import("../pages/Article.vue"),
  },
  {
    name: "edit-article",
    path: "/article/:slug/edit",
    component: () => import("../pages/EditArticle.vue"),
    meta: { auth: true }, // 需要登录
  },
  {
    name: "create-article",
    path: "/article/create",
    component: () => import("../pages/EditArticle.vue"),
    meta: { auth: true }, // 需要登录
  },
  {
    name: "login",
    path: "/login",
    component: () => import("../pages/Login.vue"),
    meta: { guest: true }, // 已登录用户不能访问
  },
  {
    name: "register",
    path: "/register",
    component: () => import("../pages/Register.vue"),
    meta: { guest: true }, // 已登录用户不能访问
  },
  {
    name: "profile",
    path: "/profile/:username",
    component: () => import("../pages/Profile.vue"),
  },
  {
    name: "profile-favorites",
    path: "/profile/:username/favorites",
    component: () => import("../pages/Profile.vue"),
  },
  {
    name: "settings",
    path: "/settings",
    component: () => import("../pages/Settings.vue"),
    meta: { auth: true }, // 需要登录
  },
];
