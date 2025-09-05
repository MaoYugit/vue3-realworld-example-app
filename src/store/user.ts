import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { api } from "src/services";
import type { User } from "src/services/api";
import Storage from "src/utils/storage";

/**
 *  ⭐⭐⭐‼️待重构‼️
 *  不导出userStorage的核心原因是：封装实现细节 (Encapsulation)。
 *
 *  userStore 的职责：
 *    userStore 就像一个公司的 “人事部经理” 。它的职责是管理员工（用户）的所有信息。
 *    所有其他部门（组件）如果想知道某个员工的信息，或者想入职/离职一个员工，都应该只和“人事部经理”对话。
 *
 *  userStorage 的角色：
 *    userStorage 就像是人事部经理用来存放员工档案的那个 “文件柜” (localStorage)。
 *    这个“文件柜”是人事部的内部工具，属于它的实现细节。
 *
 *  导出 userStorage 的问题：
 *    如果我们把 userStorage 导出去，就相当于把“文件柜”的钥匙给了公司里的每一个人。
 *    这意味着，任何一个组件都可以绕过“人事部经理” (userStore)，
 *    直接去“文件柜”里随意读取甚至修改员工档案！
 *    比如，某个组件可以偷偷地执行 userStorage.set(...) 来修改用户信息，
 *    而 userStore 内部的 user ref 状态对此毫不知情！这就导致了状态不同步，
 *    这是大型应用中最难调试的 Bug 之一。
 *
 *  总结：
 *    userStore 应该像一个“黑盒”。外部世界只关心它提供了哪些接口（user, isAuthorized, updateUser），
 *    而不应该关心它内部是用 localStorage 还是 cookie 或是别的什么技术来实现数据持久化的。
 *    将 userStorage 作为 userStore 的私有内部工具（不导出），就是对这种封装原则的完美实践。
 */
// export const userStorage = new Storage<User>("user");

/**
 * ‼️已重构‼️
 *
 * 不导出isAuthorized：维护“单一数据源 (Single Source of Truth)”原则。
 *
 * isAuthorized 提供了“数据的第二个入口”：
 *    这个函数直接去读取 localStorage (userStorage.get()) 来判断用户是否登录。完全绕过了 Pinia 的状态管理。
 *    而 useUserStore 内部，我们有一个响应式的 isAuthorized 计算属性。
 *    这就导致了在我们的应用中，存在两个地方可以查询“用户是否登录”这个状态，而且它们的行为模式完全不同
 *    （一个是普通的函数调用，一个是响应式的 getter）。这会造成混乱。
 *
 * isAuthorized 不是响应式的：
 *    这是最关键的问题。isAuthorized() 只是在它被调用的那一瞬间，对 localStorage 做了一次“快照”读取。
 *    如果用户在一个标签页中点击了“登出”，userStore 的状态更新了，localStorage 也被清空了。但在另一个
 *    没有刷新的标签页中，如果某个旧的逻辑（比如一个定时器）再次调用了这个旧的 isAuthorized() 函数，
 *    它会得到一个过时的、错误的结果。而 userStore.isAuthorized 是响应式的。
 *    一旦 user.value 变为 null，所有依赖 isAuthorized getter
 *    的地方都会自动更新，确保了数据的一致性。
 *
 * 总结：
 *    为了让整个应用的所有部分都通过唯一的、响应式的 useUserStore 来获取用户状态，
 *    我们必须“堵上”isAuthorized() 这个“后门”。这让我们的状态流向变得清晰、可预测且不会出错。
 */
// export const isAuthorized = (): boolean => !!userStorage.get()

export const useUserStore = defineStore("user", () => {
  // 把 userStorage 的定义【移动到】 setup 函数内部
  const userStorage = new Storage<User>("user");
  // --- State (状态) ---
  // 创建一个核心的 ref 变量 `user`。
  //    它的初始值，直接从我们刚刚创建的 userStorage (localStorage) 中读取。
  //    这意味着，即使用户刷新页面，这个状态也能从本地存储中恢复。
  const user = ref(userStorage.get());

  // --- Getters (计算属性) ---
  // 创建一个计算属性 `isAuthorized`。
  //    它依赖于 `user` ref。
  //    `!!user.value` 是一个将值转换为布尔值的技巧：
  //    - 如果 user.value 是一个用户对象 (truthy)，`!!user.value` 就是 true。
  //    - 如果 user.value 是 null (falsy)，`!!user.value` 就是 false。
  //    因为它是 computed，所以当 `user.value` 变化时，`isAuthorized.value` 也会自动更新。
  const isAuthorized = computed(() => !!user.value);

  // --- Actions (方法) ---
  // 定义一个核心的 action 函数 `updateUser`，用来更新用户的状态。
  //     它接收一个可选的参数 `userData`，这个参数可以是 User 对象，也可以是 null。
  function updateUser(userData?: User | null) {
    if (userData) {
      // --- 用户登录或注册成功的逻辑 ---
      // 调用 userStorage.set()，把完整的用户数据（包含 token）序列化后存入 localStorage。
      //     这是实现“持久化登录”的关键。
      userStorage.set(userData);

      // 调用全局 API 实例的 `setSecurityData` 方法。
      //     它的作用是把用户的 `token` 告诉 API 客户端。
      //     API 客户端内部会把这个 token 存起来，并在之后所有需要认证的请求中，
      //     通过配置的 `securityWorker` 自动把它添加到请求头里。
      api.setSecurityData(userData.token);

      // 更新 Pinia store 内部的 `user` ref 的值。
      //     这个操作会触发所有依赖 `user` 或 `isAuthorized` 的组件进行响应式更新。
      user.value = userData;
    }
    // --- 用户登出或状态清除的逻辑 ---
    else {
      // 调用 userStorage.remove()，从 localStorage 中移除 'user' 数据。
      userStorage.remove();
      // 调用 `setSecurityData`，但传入 `null`，通知 API 客户端清除之前保存的 token。
      api.setSecurityData(null);
      // 把 Pinia store 内部的 `user` ref 的值也设为 `null`。
      user.value = null;
    }
  }

  return {
    user,
    isAuthorized,
    updateUser,
  };
});
