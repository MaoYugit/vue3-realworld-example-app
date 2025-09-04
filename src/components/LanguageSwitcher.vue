<template>
  <div class="language-switcher">
    <select v-model="currentLocale" @change="onLocaleChange">
      <option
        v-for="locale in availableLocales"
        :key="locale.value"
        :value="locale.value"
      >
        {{ locale.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { availableLocales, setLocale, type Locale } from "src/plugins/i18n";

// 从 vue-i18n 中获取当前的 locale
const { locale } = useI18n();

// 创建一个计算属性，用于 v-model 双向绑定
const currentLocale = computed({
  get: () => locale.value,
  set: (newLocale) => {
    setLocale(newLocale as Locale);
  },
});

// 或者用一个更简单的方法，只处理 change 事件
function onLocaleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setLocale(target.value as Locale);
}
</script>

<!-- 添加一点简单的样式 -->
<style scoped>
.language-switcher select {
  background-color: transparent;
  margin-top: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  color: #aaa;
  cursor: pointer;
}
.language-switcher select option {
  color: #333;
}
</style>
