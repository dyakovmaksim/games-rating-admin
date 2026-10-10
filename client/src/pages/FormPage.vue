<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { api } from "../services/api";
import { useNotice } from "../composables/useNotice";
import GameForm from "../components/GameForm.vue";
const route = useRoute(),
  router = useRouter(),
  { notify } = useNotice();
const editing = computed(() => !!route.params.id);
const game = ref(null),
  loading = ref(editing.value),
  busy = ref(false),
  dirty = ref(false),
  error = ref(""),
  serverErrors = ref({});
let saved = false;
async function load() {
  loading.value = true;
  error.value = "";
  try {
    game.value = await api.get(route.params.id);
    dirty.value = false;
  } catch (e) {
    error.value = e.status === 404 ? "Игра не найдена." : e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(() => {
  if (editing.value) load();
  window.addEventListener("beforeunload", beforeUnload);
});
onBeforeUnmount(() => window.removeEventListener("beforeunload", beforeUnload));
function beforeUnload(event) {
  if (dirty.value && !saved) {
    event.preventDefault();
    event.returnValue = "";
  }
}
onBeforeRouteLeave(() => {
  if (dirty.value && !saved)
    return window.confirm("Есть несохранённые изменения. Покинуть страницу?");
});
function cancel() {
  router.push(editing.value ? `/games/${route.params.id}` : "/games");
}
async function submit(data) {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  serverErrors.value = {};
  try {
    const result = editing.value
      ? await api.update(route.params.id, data)
      : await api.create(data);
    saved = true;
    notify(editing.value ? "Изменения сохранены." : "Игра добавлена.");
    router.push(`/games/${result.id}`);
  } catch (e) {
    error.value = e.message;
    serverErrors.value = e.details || {};
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <div class="page-head page-head--compact">
    <div>
      <p class="eyebrow">
        GameDesk / <RouterLink to="/games">Каталог</RouterLink> /
        {{ editing ? "Редактирование" : "Добавление" }}
      </p>
      <h1>{{ editing ? "Редактировать игру" : "Новая игра" }}</h1>
      <p class="lead">Заполните данные каталога и сохраните запись.</p>
    </div>
  </div>
  <div v-if="loading" class="state" role="status">Загружаем игру…</div>
  <div
    v-else-if="error && editing && !game"
    class="state state--error"
    role="alert"
  >
    {{ error }}
    <button class="button button--outline" @click="load">Повторить</button>
  </div>
  <template v-else
    ><p v-if="error" class="alert" role="alert">{{ error }}</p>
    <GameForm
      :initial="game"
      :busy="busy"
      :server-errors="serverErrors"
      @submit="submit"
      @cancel="cancel"
      @dirty="dirty = $event"
  /></template>
</template>
