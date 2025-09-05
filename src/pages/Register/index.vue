<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <!-- 标题 -->
          <h1 class="text-xs-center">{{ t("register.signUp") }}</h1>
          <!-- 提示链接 -->
          <p class="text-xs-center">
            <AppLink name="login">{{ t("register.haveAnAccount") }}</AppLink>
          </p>

          <!-- 错误信息展示区 -->
          <ul class="error-messages">
            <!-- v-for 遍历 `errors` ref 对象。当注册失败时，这里会显示错误列表。 -->
            <li v-for="(error, field) in errors" :key="field">
              {{ field }} {{ error ? error[0] : "" }}
            </li>
          </ul>

          <!-- 表单元素 -->
          <form
            ref="formRef"
            aria-label="Registration form"
            @submit.prevent="register"
          >
            <!-- 一组相关的表单控件 -->
            <!-- 姓名输入框 -->
            <fieldset class="form-group">
              <input
                v-model="form.username"
                aria-label="Username"
                class="form-control form-control-lg"
                type="text"
                required
                :placeholder="t('register.yourName')"
              />
            </fieldset>
            <!-- 邮箱输入框 -->
            <fieldset class="form-group">
              <input
                v-model="form.email"
                aria-label="Email"
                class="form-control form-control-lg"
                type="email"
                required
                :placeholder="t('register.email')"
              />
            </fieldset>
            <!-- 密码输入框 -->
            <fieldset class="form-group">
              <input
                v-model="form.password"
                aria-label="Password"
                class="form-control form-control-lg"
                type="password"
                :minLength="8"
                required
                :placeholder="t('register.password')"
              />
            </fieldset>
            <!-- 提交按钮 -->
            <!-- 动态禁用按钮：如果邮箱、用户名或密码任一为空，则禁用此按钮 -->
            <button
              type="submit"
              class="btn btn-lg btn-primary pull-xs-right"
              :disabled="!(form.email && form.username && form.password)"
            >
              {{ t("register.signUp") }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { routerPush } from "src/router";
import { useI18n } from "vue-i18n";
import { api, isFetchError } from "src/services";
import type { NewUser } from "src/services/api";
import { useUserStore } from "src/store/user";

const { t } = useI18n();

// ref 变量 `formRef`, 用来引用 <template> 中的 <form> DOM 元素，以便我们可以调用浏览器原生的表单方法
const formRef = ref<HTMLFormElement | null>(null);

// 响应式对象 `form`，用来存储用户在表单中输入的数据
const form: NewUser = reactive({
  username: "",
  email: "",
  password: "",
});

const { updateUser } = useUserStore();

// 用来存放从后端 API 返回的验证错误信息, 初始值为 undefined
const errors = ref();

// 用户提交表单时被调用
async function register() {
  // 在每次尝试注册前，先清空上一次的错误信息，避免旧的错误一直显示在页面上
  errors.value = {};

  // 如果表单没有通过验证（比如某个 `required` 的字段是空的），就直接 `return`，中止函数执行。
  if (!formRef.value?.checkValidity()) return;

  try {
    // 调用 API 客户端的 `createUser` 方法
    const result = await api.users.createUser({ user: form });

    // 调用从 userStore 中获取的 `updateUser` action
    //      把从 `result` 中解析出的用户数据 `result.data.user` 传递过去，
    //      让 Pinia 更新全局的用户状态，并把 token 存起来。
    updateUser(result.data.user);

    // 调用封装的 `routerPush` 函数
    //      `await` 确保在跳转前，`updateUser` 的操作已经完成
    //      `'global-feed'` 是首页的路由名称，这行代码会把用户导航到首页
    await routerPush("global-feed");
  } catch (error) {
    // 判断这个错误是不是我们预期的 API 错误格式
    if (isFetchError(error)) {
      // 如果是，就把错误对象中真正包含验证信息的 `error.error.errors` 部分，
      //     赋值给我 `errors` ref 变量。
      //     Vue 的响应式系统会立刻侦测到 `errors` 的变化，并更新模板中的 `v-for`，把错误信息显示给用户。
      errors.value = error.error?.errors;
    }
  }
}
</script>
