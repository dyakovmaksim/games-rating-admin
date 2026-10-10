<script setup>
import { ref } from "vue";
import { useNotice } from "./composables/useNotice";
import { api } from "./services/api";
const { message, notify } = useNotice();
const resetting = ref(false);
async function reset() {
  if (
    !window.confirm(
      "Восстановить исходные демонстрационные записи? Ваши изменения будут удалены.",
    )
  )
    return;
  resetting.value = true;
  try {
    await api.reset();
    notify("Демонстрационные данные восстановлены.");
    window.location.assign("/");
  } catch (error) {
    notify(error.message);
  } finally {
    resetting.value = false;
  }
}
</script>
<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/"
        ><span class="brand__symbol">G<span>.</span></span
        ><span>GameDesk<small>Каталог игр</small></span></RouterLink
      >
      <nav aria-label="Основная навигация">
        <RouterLink to="/" exact-active-class="active">Обзор</RouterLink
        ><RouterLink to="/games" active-class="active">Каталог</RouterLink
        ><RouterLink to="/games/new" active-class="active"
          >Добавить игру</RouterLink
        >
      </nav>
      <div class="sidebar__bottom">
        <span class="demo-dot"></span><strong>Демонстрационный режим</strong>
        <p>Изменения видны только вам и хранятся ограниченное время.</p>
        <button
          class="button button--outline"
          :disabled="resetting"
          @click="reset"
        >
          Восстановить данные
        </button>
      </div>
    </aside>
    <div class="workspace">
      <header class="mobile-bar">
        <RouterLink class="brand" to="/"
          >G<span>.</span> <b>GameDesk</b></RouterLink
        ><button type="button" :disabled="resetting" @click="reset">
          Демо: восстановить
        </button>
      </header>
      <main id="main"><RouterView /></main>
      <nav class="mobile-nav" aria-label="Мобильная навигация">
        <RouterLink to="/" exact-active-class="active">Обзор</RouterLink
        ><RouterLink to="/games" active-class="active">Каталог</RouterLink
        ><RouterLink to="/games/new" active-class="active">Добавить</RouterLink>
      </nav>
    </div>
    <div v-if="message" class="notice" role="status" aria-live="polite">
      {{ message }}
    </div>
  </div>
</template>
