<template>
  <div class="settings-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">{{ t("setting.setting") }}</h1>

          <ul class="error-messages">
            <li v-for="(error, field) in errors" :key="field">
              {{ field }} {{ error ? error[0] : "" }}
            </li>
          </ul>

          <form @submit.prevent="onSubmit">
            <fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.image"
                  aria-label="Avatar picture url"
                  type="text"
                  class="form-control"
                  :placeholder="t('setting.URLofPP')"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.username"
                  aria-label="Username"
                  type="text"
                  class="form-control form-control-lg"
                  :placeholder="t('setting.name')"
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  v-model="form.bio"
                  aria-label="Bio"
                  class="form-control form-control-lg"
                  :rows="8"
                  :placeholder="t('setting.bio')"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.email"
                  aria-label="Email"
                  type="email"
                  class="form-control form-control-lg"
                  :placeholder="t('setting.email')"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.password"
                  aria-label="New password"
                  type="password"
                  class="form-control form-control-lg"
                  :placeholder="t('setting.newPassword')"
                />
              </fieldset>
              <button
                class="btn btn-lg btn-primary pull-xs-right"
                :disabled="isButtonDisabled"
                type="submit"
              >
                {{ t("setting.updateSetting") }}
              </button>
            </fieldset>
          </form>

          <hr />

          <button
            class="btn btn-outline-danger"
            aria-label="Logout"
            @click="onLogout"
          >
            {{ t("setting.logout") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { routerPush } from "src/router";
import { useI18n } from "vue-i18n";
import { api, isFetchError } from "src/services";
import type { UpdateUser } from "src/services/api";
import { useUserStore } from "src/store/user";

const { t } = useI18n();

const form: UpdateUser = reactive({});

const userStore = useUserStore();
const errors = ref();

async function onSubmit() {
  errors.value = {};

  try {
    // eslint-disable-next-line unicorn/no-array-reduce
    const filteredForm = Object.entries(form).reduce(
      (form, [k, v]) => (v === null ? form : Object.assign(form, { [k]: v })),
      {}
    );
    const userData = await api.user
      .updateCurrentUser({ user: filteredForm })
      .then((res) => res.data.user);
    userStore.updateUser(userData);
    await routerPush("profile", { username: userData.username });
  } catch (error) {
    if (isFetchError(error)) errors.value = error.error?.errors;
  }
}

async function onLogout() {
  userStore.updateUser(null);
  await routerPush("global-feed");
}

onMounted(async () => {
  if (!userStore.isAuthorized) return await routerPush("login");

  form.image = userStore.user?.image;
  form.username = userStore.user?.username;
  form.bio = userStore.user?.bio;
  form.email = userStore.user?.email;
});

const isButtonDisabled = computed(
  () =>
    form.image === userStore.user?.image &&
    form.username === userStore.user?.username &&
    form.bio === userStore.user?.bio &&
    form.email === userStore.user?.email &&
    !form.password
);
</script>
