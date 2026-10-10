<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "../services/api";
import GameCover from "../components/GameCover.vue";
const route = useRoute(),
  game = ref(null),
  error = ref(""),
  loading = ref(true);
async function load() {
  loading.value = true;
  error.value = "";
  try {
    game.value = await api.get(route.params.id);
  } catch (e) {
    error.value = e.status === 404 ? "Игра не найдена." : e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>
<template>
  <div v-if="loading" class="state" role="status">Загружаем игру…</div>
  <div v-else-if="error" class="state state--error" role="alert">
    <h1>{{ error }}</h1>
    <RouterLink to="/games" class="button button--outline"
      >Вернуться в каталог</RouterLink
    ><button class="button button--quiet" @click="load">Повторить</button>
  </div>
  <template v-else
    ><div class="page-head page-head--compact">
      <div>
        <p class="eyebrow">
          GameDesk / <RouterLink to="/games">Каталог</RouterLink> / Просмотр
        </p>
        <h1>{{ game.title }}</h1>
        <span class="badge" :class="game.status">{{
          game.status === "published" ? "Опубликовано" : "Черновик"
        }}</span>
      </div>
      <RouterLink :to="`/games/${game.id}/edit`" class="button button--primary"
        >Редактировать</RouterLink
      >
    </div>
    <div class="detail-grid">
      <GameCover :game="game" large />
      <div class="panel detail-content">
        <h2>Об игре</h2>
        <p class="description">{{ game.description }}</p>
        <dl>
          <div>
            <dt>Жанр</dt>
            <dd>{{ game.genre }}</dd>
          </div>
          <div>
            <dt>Платформа</dt>
            <dd>{{ game.platform }}</dd>
          </div>
          <div>
            <dt>Дата выхода</dt>
            <dd>
              {{ new Date(game.releaseDate).toLocaleDateString("ru-RU") }}
            </dd>
          </div>
          <div>
            <dt>Добавлена</dt>
            <dd>{{ new Date(game.createdAt).toLocaleDateString("ru-RU") }}</dd>
          </div>
          <div>
            <dt>Изменена</dt>
            <dd>{{ new Date(game.updatedAt).toLocaleDateString("ru-RU") }}</dd>
          </div>
        </dl>
        <a
          class="button button--outline"
          :href="game.gameUrl"
          target="_blank"
          rel="noopener noreferrer"
          >Открыть ссылку на игру ↗</a
        >
      </div>
    </div>
  </template>
</template>
