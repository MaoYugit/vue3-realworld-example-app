<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">{{ t("login.signIn") }}</h1>
          <p class="text-xs-center">
            <AppLink name="register">{{ t("login.needAccount") }}</AppLink>
          </p>

          <ul class="error-messages">
            <li v-for="(error, field) in errors" :key="field">
              {{ field }} {{ error ? error[0] : "" }}
            </li>
          </ul>

          <form ref="formRef" aria-label="Login form" @submit.prevent="login">
            <fieldset class="form-group" aria-required="true">
              <input
                v-model="form.email"
                aria-label="Email"
                class="form-control form-control-lg"
                type="email"
                required
                :placeholder="t('login.email')"
              />
            </fieldset>
            <fieldset class="form-group">
              <input
                v-model="form.password"
                aria-label="Password"
                class="form-control form-control-lg"
                type="password"
                required
                :placeholder="t('login.password')"
              />
            </fieldset>
            <button
              class="btn btn-lg btn-primary pull-xs-right"
              :disabled="!form.email || !form.password"
              type="submit"
            >
              {{ t("login.signIn") }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { routerPush } from "src/router";
import { api, isFetchError } from "src/services";
import type { LoginUser } from "src/services/api";
import { useUserStore } from "src/store/user";

const { t } = useI18n();

const formRef = ref<HTMLFormElement | null>(null);
const form: LoginUser = reactive({
  email: "",
  password: "",
});

const { updateUser } = useUserStore();

const errors = ref();

async function login() {
  errors.value = {};

  if (!formRef.value?.checkValidity()) return;

  try {
    const result = await api.users.login({ user: form });
    updateUser(result.data.user);
    await routerPush("global-feed");
  } catch (error) {
    if (isFetchError(error)) {
      errors.value = error.error?.errors;
      return;
    }
    console.error(error);
  }
}
</script>
