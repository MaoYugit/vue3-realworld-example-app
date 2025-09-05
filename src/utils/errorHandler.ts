// src/utils/errorHandler.ts

import { isFetchError } from "../services";
import { useUserStore } from "../store/user";
import { routerPush } from "../router";

/**
 * 全局错误处理器。
 * 接收一个未知的错误，并根据其类型执行相应的全局副作用。
 * @param error - 捕获到的未知错误
 */
export async function handleGlobalError(error: unknown): Promise<void> {
  // 我们只关心一种特定的全局错误：API 返回的 401 未授权错误
  if (isFetchError(error) && error.status === 401) {
    // 如果确认是 401 错误，执行登出逻辑

    // 1. 获取 userStore 实例
    const userStore = useUserStore();

    // 2. 调用 action 来清空用户状态 (localStorage, Pinia state, api client token)
    userStore.updateUser(null);

    // 3. 跳转到登录页
    await routerPush("login");

    // 4. （可选）可以在这里弹出一个全局提示，告诉用户“您的登录已过期，请重新登录”
    //    比如：toast.error('Your session has expired. Please log in again.');

    // 注意：我们在这里“消费”掉了这个错误，不再需要把它重新抛出。
    return;
  }

  // 对于所有其他类型的错误，我们选择不在这里处理，
  // 而是让最初调用 API 的地方自己去 catch。
  // 所以我们把错误原封不动地再次抛出去。
  throw error;
}
