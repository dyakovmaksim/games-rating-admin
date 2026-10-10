<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  game: { type: Object, required: true },
  large: Boolean,
});
const failed = ref(false);
watch(
  () => props.game.imageUrl,
  () => {
    failed.value = false;
  },
);
</script>
<template>
  <div class="cover" :class="{ 'cover--large': large }">
    <img
      v-if="game.imageUrl && !failed"
      :src="game.imageUrl"
      :alt="`Обложка игры ${game.title}`"
      @error="failed = true"
    />
    <div v-else class="cover__fallback" aria-hidden="true">
      <span class="cover__mark">G<span>.</span></span
      ><strong>{{ game.title }}</strong>
    </div>
  </div>
</template>
