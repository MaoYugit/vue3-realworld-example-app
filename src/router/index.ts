// src/router/index.ts

import type { RouteParams } from "vue-router";
import { createRouter, createWebHashHistory } from "vue-router";
import { routes, type AppRouteNames } from "./routes"; // 导入路由定义
import { setupGuards } from "./guards"; // 导入守卫设置函数

// 1. 创建 router 实例
export const router = createRouter({
  history: createWebHashHistory(),
  routes, // 使用从 routes.ts 导入的路由
});

// 2. 为 router 实例安装导航守卫
setupGuards(router);

// 3. 封装的 routerPush 函数也可以放在这里
export function routerPush(
  name: AppRouteNames,
  params?: RouteParams
): ReturnType<typeof router.push> {
  return params === undefined
    ? router.push({ name })
    : router.push({ name, params });
}
