// src/router/guards.ts

// 这个文件只负责定义所有的路由权限检查逻辑

import type { Router } from "vue-router";
import { useUserStore } from "../store/user"; // 确保路径正确

export function setupGuards(router: Router): void {
  // 全局前置守卫
  router.beforeEach((to, _from, next) => {
    const userStore = useUserStore();

    // 规则1：检查目标页面是否需要登录
    if (to.meta.auth && !userStore.isAuthorized) {
      // 用户未登录，但想访问需要授权的页面 -> 重定向到登录页
      next({ name: "login" });
    }
    // 规则2：检查目标页面是否是已登录用户不应访问的（如登录页）
    else if (to.meta.guest && userStore.isAuthorized) {
      // 用户已登录，但想访问登录/注册页 -> 重定向到首页
      next({ name: "global-feed" });
    }
    // 规则3：其他所有情况，直接放行
    else {
      next();
    }
  });

  // 如果将来有其他全局守卫（如 afterEach），也可以在这里添加
  // router.afterEach((to, from) => {
  //   console.log(`Navigated from ${from.path} to ${to.path}`)
  // })
}
