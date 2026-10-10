<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
const props = defineProps({
  open: Boolean,
  title: String,
  message: String,
  busy: Boolean,
});
const emit = defineEmits(["close", "confirm"]);
const dialog = ref(null);
const cancel = ref(null);
let returnFocus;
watch(
  () => props.open,
  async (value) => {
    if (value) {
      returnFocus = document.activeElement;
      await nextTick();
      dialog.value?.showModal();
      cancel.value?.focus();
    } else {
      dialog.value?.close();
      returnFocus?.focus();
    }
  },
);
function close() {
  if (!props.busy) emit("close");
}
function trap(event) {
  if (event.key !== "Tab") return;
  const items = [...dialog.value.querySelectorAll("button:not(:disabled)")];
  if (event.shiftKey && document.activeElement === items[0]) {
    event.preventDefault();
    items.at(-1).focus();
  } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
    event.preventDefault();
    items[0].focus();
  }
}
onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close();
  returnFocus?.focus();
});
</script>
<template>
  <dialog
    ref="dialog"
    class="dialog"
    aria-labelledby="confirm-title"
    @cancel.prevent="close"
    @keydown="trap"
  >
    <h2 id="confirm-title">{{ title }}</h2>
    <p>{{ message }}</p>
    <div class="dialog__actions">
      <button
        ref="cancel"
        class="button button--quiet"
        type="button"
        :disabled="busy"
        @click="close"
      >
        Отмена</button
      ><button
        class="button button--danger"
        type="button"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? "Удаляем…" : "Удалить" }}
      </button>
    </div>
  </dialog>
</template>
