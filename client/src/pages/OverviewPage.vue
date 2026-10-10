<script setup>
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import GameCover from "../components/GameCover.vue";
const stats = ref(null),
  error = ref(""),
  loading = ref(true);
async function load() {
  loading.value = true;
  error.value = "";
  try {
    stats.value = await api.stats();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>
<template>
  <div class="page-head">
    <div>
      <p class="eyebrow">GameDesk / Обзор</p>
      <h1>Всё по играм —<br />в одном месте.</h1>
      <p class="lead">Управляйте каталогом: от черновика до публикации.</p>
    </div>
    <RouterLink to="/games/new" class="button button--primary"
      >+ Добавить игру</RouterLink
    >
  </div>
  <div v-if="loading" class="state" role="status">Загружаем данные…</div>
  <div v-else-if="error" class="state state--error" role="alert">
    {{ error }}
    <button class="button button--outline" @click="load">Повторить</button>
  </div>
  <template v-else
    ><section class="stats" aria-label="Показатели каталога">
      <div>
        <span>Всего игр</span><strong>{{ stats.total }}</strong>
      </div>
      <div>
        <span>Опубликовано</span><strong>{{ stats.published }}</strong>
      </div>
      <div>
        <span>Черновиков</span><strong>{{ stats.drafts }}</strong>
      </div>
    </section>
    <div class="overview-grid">
      <section class="panel">
        <div class="section-heading">
          <h2>Распределение по жанрам</h2>
          <span>{{ stats.genres.length }} жанров</span>
        </div>
        <div v-if="!stats.genres.length" class="empty">
          Пока нет игр. Добавьте первую запись.
        </div>
        <ul v-else class="genre-list">
          <li v-for="item in stats.genres" :key="item.genre">
            <span>{{ item.genre }}</span>
            <div class="genre-track">
              <div
                :style="{ width: `${(item.count / stats.total) * 100}%` }"
              ></div>
            </div>
            <strong>{{ item.count }}</strong>
          </li>
        </ul>
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>Добавлены недавно</h2>
          <RouterLink to="/games">Весь каталог</RouterLink>
        </div>
        <div v-if="!stats.recent.length" class="empty">
          Недавних игр пока нет.
        </div>
        <ul v-else class="recent-list">
          <li v-for="game in stats.recent" :key="game.id">
            <GameCover :game="game" />
            <div>
              <RouterLink :to="`/games/${game.id}`">{{ game.title }}</RouterLink
              ><span
                >{{ game.genre }} ·
                {{
                  game.status === "published" ? "Опубликовано" : "Черновик"
                }}</span
              >
            </div>
          </li>
        </ul>
      </section>
    </div>
  </template>
</template>
