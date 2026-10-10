<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue";
import { validateGame, blankGame } from "../utils/validation";
import GameCover from "./GameCover.vue";
const props = defineProps({
  initial: Object,
  busy: Boolean,
  serverErrors: Object,
});
const emit = defineEmits(["submit", "cancel", "dirty"]);
const form = reactive({ ...blankGame(), ...(props.initial || {}) });
const errors = ref({});
const fields = reactive({});
const preview = computed(() => ({
  title: form.title || "Название игры",
  imageUrl: form.imageUrl,
}));
watch(
  () => props.initial,
  (value) => {
    if (value) Object.assign(form, value);
  },
);
watch(
  () => ({ ...form }),
  () => {
    const keys = Object.keys(blankGame());
    emit(
      "dirty",
      keys.some(
        (key) => form[key] !== (props.initial?.[key] ?? blankGame()[key]),
      ),
    );
  },
  { deep: true },
);
watch(
  () => props.serverErrors,
  (value) => {
    if (value) errors.value = { ...errors.value, ...value };
  },
);
function submit() {
  const checked = validateGame(form);
  errors.value = checked.errors;
  if (Object.keys(errors.value).length) {
    nextTick(() => fields[Object.keys(errors.value)[0]]?.focus());
    return;
  }
  emit("submit", checked.game);
}
</script>
<template>
  <form class="editor-grid" novalidate @submit.prevent="submit">
    <div class="form-panel panel">
      <h2>Информация об игре</h2>
      <p class="muted">Поля со звёздочкой обязательны.</p>
      <div class="form-grid">
        <label class="full"
          ><span>Название *</span
          ><input
            :ref="(el) => (fields.title = el)"
            v-model="form.title"
            maxlength="120"
            :aria-invalid="!!errors.title"
            aria-describedby="error-title"
          /><small v-if="errors.title" id="error-title" class="field-error">{{
            errors.title
          }}</small></label
        >
        <label class="full"
          ><span>Описание *</span
          ><textarea
            :ref="(el) => (fields.description = el)"
            v-model="form.description"
            rows="6"
            maxlength="2000"
            :aria-invalid="!!errors.description"
            aria-describedby="error-description"
          ></textarea
          ><small
            v-if="errors.description"
            id="error-description"
            class="field-error"
            >{{ errors.description }}</small
          ></label
        >
        <label
          ><span>Жанр *</span
          ><input
            :ref="(el) => (fields.genre = el)"
            v-model="form.genre"
            maxlength="60"
            list="genres"
            :aria-invalid="!!errors.genre"
            aria-describedby="error-genre"
          /><small v-if="errors.genre" id="error-genre" class="field-error">{{
            errors.genre
          }}</small></label
        >
        <label
          ><span>Платформа *</span
          ><input
            :ref="(el) => (fields.platform = el)"
            v-model="form.platform"
            maxlength="60"
            list="platforms"
            :aria-invalid="!!errors.platform"
            aria-describedby="error-platform"
          /><small
            v-if="errors.platform"
            id="error-platform"
            class="field-error"
            >{{ errors.platform }}</small
          ></label
        >
        <datalist id="genres">
          <option
            v-for="genre in [
              'Экшен',
              'Приключение',
              'Ролевая игра',
              'Платформер',
              'Головоломка',
              'Симулятор',
              'Другое',
            ]"
            :key="genre"
            :value="genre"
          /></datalist
        ><datalist id="platforms">
          <option
            v-for="platform in [
              'PC',
              'PlayStation',
              'Xbox',
              'Nintendo Switch',
              'Web',
            ]"
            :key="platform"
            :value="platform"
          />
        </datalist>
        <label
          ><span>Дата выхода *</span
          ><input
            :ref="(el) => (fields.releaseDate = el)"
            v-model="form.releaseDate"
            type="date"
            :aria-invalid="!!errors.releaseDate"
            aria-describedby="error-releaseDate"
          /><small
            v-if="errors.releaseDate"
            id="error-releaseDate"
            class="field-error"
            >{{ errors.releaseDate }}</small
          ></label
        >
        <label
          ><span>Статус *</span
          ><select
            :ref="(el) => (fields.status = el)"
            v-model="form.status"
            :aria-invalid="!!errors.status"
            aria-describedby="error-status"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option></select
          ><small v-if="errors.status" id="error-status" class="field-error">{{
            errors.status
          }}</small></label
        >
        <label class="full"
          ><span>Ссылка на игру *</span
          ><input
            :ref="(el) => (fields.gameUrl = el)"
            v-model="form.gameUrl"
            type="url"
            placeholder="https://example.com/game"
            :aria-invalid="!!errors.gameUrl"
            aria-describedby="error-gameUrl"
          /><small
            v-if="errors.gameUrl"
            id="error-gameUrl"
            class="field-error"
            >{{ errors.gameUrl }}</small
          ></label
        >
        <label class="full"
          ><span>Ссылка на обложку</span
          ><input
            :ref="(el) => (fields.imageUrl = el)"
            v-model="form.imageUrl"
            type="url"
            placeholder="https://example.com/cover.jpg"
            :aria-invalid="!!errors.imageUrl"
            aria-describedby="error-imageUrl"
          /><small
            v-if="errors.imageUrl"
            id="error-imageUrl"
            class="field-error"
            >{{ errors.imageUrl }}</small
          ></label
        >
      </div>
      <div class="form-actions">
        <button class="button button--primary" type="submit" :disabled="busy">
          {{ busy ? "Сохраняем…" : "Сохранить игру" }}</button
        ><button
          class="button button--quiet"
          type="button"
          :disabled="busy"
          @click="emit('cancel')"
        >
          Отмена
        </button>
      </div>
    </div>
    <aside class="preview panel">
      <h2>Предпросмотр обложки</h2>
      <GameCover :game="preview" large />
      <p>Если ссылка недоступна, появится обложка с названием.</p>
    </aside>
  </form>
</template>
