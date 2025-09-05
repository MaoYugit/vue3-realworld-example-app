import { api } from "src/services";
import { useUserStore } from "src/store/user";

export default function (): void {
  // 【重要】在 Pinia 插件系统之外，直接调用 useUserStore() 是有风险的，
  //    因为它依赖于 Pinia 实例被 app.use(pinia) 安装。
  //    但是，因为这个 setAuthorizationToken() 函数是在 main.ts 中，
  //    在 app.use(createPinia()) 【之后】才被调用的，所以在这里是安全的。

  // 获取 userStore 实例
  const userStore = useUserStore();

  // 从 store 的 state 中获取 token
  const token = userStore.user?.token;
  if (token !== undefined) api.setSecurityData(token);
}
