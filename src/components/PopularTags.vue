<template>
  <p>
    {{ t("navigation.popularTags") }}
  </p>

  <div class="tag-list">
    <AppLink
      v-for="tag in tags"
      :key="tag"
      name="tag"
      :params="{ tag }"
      :aria-label="tag"
      class="tag-pill tag-default"
    >
      {{ tag }}
    </AppLink>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTags } from "src/composable/useTags";

const { tags, fetchTags } = useTags();
const { t } = useI18n();
await fetchTags();
</script>
