<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../services/api";
import { useNotice } from "../composables/useNotice";
import GameCover from "../components/GameCover.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
const route = useRoute(),
  router = useRouter(),
  { notify } = useNotice();
const result = ref(null),
  stats = ref(null),
  error = ref(""),
  loading = ref(true),
  deleting = ref(false),
  target = ref(null);
const searchInput = ref(String(route.query.search || ""));
let controller, timer;
const params = computed(() => ({
  search: String(route.query.search || ""),
  genre: String(route.query.genre || ""),
  platform: String(route.query.platform || ""),
  status: String(route.query.status || ""),
  sort: String(route.query.sort || "newest"),
  page: String(route.query.page || "1"),
  limit: String(route.query.limit || "10"),
}));
function setParam(key, value) {
  const next = {
    ...route.query,
    [key]: value || undefined,
    page: key === "page" ? value : undefined,
  };
  router.push({ query: next });
}
function resetFilters() {
  searchInput.value = "";
  router.push({ query: {} });
}
function searchChanged() {
  clearTimeout(timer);
  timer = setTimeout(
    () => setParam("search", searchInput.value.trim().replace(/\s+/g, " ")),
    250,
  );
}
async function load() {
  controller?.abort();
  const current = new AbortController();
  controller = current;
  loading.value = true;
  error.value = "";
  try {
    const data = await api.list(params.value, current.signal);
    if (controller !== current) return;
    if (data.pagination.total && data.pagination.page > data.pagination.pages) {
      await router.replace({
        query: { ...route.query, page: String(data.pagination.pages) },
      });
      return;
    }
    result.value = data;
  } catch (e) {
    if (e.name !== "AbortError" && controller === current)
      error.value = e.message;
  } finally {
    if (controller === current) loading.value = false;
  }
}
async function remove() {
  if (!target.value || deleting.value) return;
  deleting.value = true;
  try {
    await api.remove(target.value.id);
    target.value = null;
    notify("Игра удалена.");
    await load();
    stats.value = await api.stats();
  } catch (e) {
    notify(e.message);
  } finally {
    deleting.value = false;
  }
}
watch(
  () => route.query,
  () => {
    searchInput.value = String(route.query.search || "");
    load();
  },
);
onMounted(async () => {
  load();
  try {
    stats.value = await api.stats();
  } catch {}
});
onBeforeUnmount(() => {
  controller?.abort();
  clearTimeout(timer);
});
</script>
<template>
  <div class="page-head page-head--compact">
    <div>
      <p class="eyebrow">GameDesk / Каталог</p>
      <h1>Каталог игр</h1>
      <p class="lead">Поиск и управление всеми записями.</p>
    </div>
    <RouterLink to="/games/new" class="button button--primary"
      >+ Добавить игру</RouterLink
    >
  </div>
  <section class="panel catalog-panel" aria-label="Список игр">
    <div class="filters">
      <label class="search-field"
        ><span>Поиск по названию</span
        ><input
          :value="searchInput"
          placeholder="Название игры"
          @input="
            searchInput = $event.target.value;
            searchChanged();
          " /></label
      ><label
        ><span>Жанр</span
        ><select
          :value="params.genre"
          @change="setParam('genre', $event.target.value)"
        >
          <option value="">Все жанры</option>
          <option v-for="genre in stats?.genresOptions || []" :key="genre">
            {{ genre }}
          </option>
        </select></label
      ><label
        ><span>Платформа</span
        ><select
          :value="params.platform"
          @change="setParam('platform', $event.target.value)"
        >
          <option value="">Все платформы</option>
          <option
            v-for="platform in stats?.platformsOptions || []"
            :key="platform"
          >
            {{ platform }}
          </option>
        </select></label
      ><label
        ><span>Статус</span
        ><select
          :value="params.status"
          @change="setParam('status', $event.target.value)"
        >
          <option value="">Все статусы</option>
          <option value="published">Опубликовано</option>
          <option value="draft">Черновик</option>
        </select></label
      >
    </div>
    <div class="catalog-tools">
      <span v-if="result"
        >Найдено: <strong>{{ result.pagination.total }}</strong></span
      ><span v-else>Каталог</span>
      <div>
        <label
          >Сортировка
          <select
            :value="params.sort"
            @change="setParam('sort', $event.target.value)"
          >
            <option value="newest">Новые сверху</option>
            <option value="oldest">Старые сверху</option>
            <option value="title">По названию</option>
            <option value="releaseNewest">Дата выхода ↓</option>
            <option value="releaseOldest">Дата выхода ↑</option>
          </select></label
        ><button class="text-button" @click="resetFilters">
          Сбросить фильтры
        </button>
      </div>
    </div>
    <div v-if="loading" class="state" role="status">Загружаем игры…</div>
    <div v-else-if="error" class="state state--error" role="alert">
      {{ error }}
      <button class="button button--outline" @click="load">Повторить</button>
    </div>
    <div v-else-if="!result.items.length" class="state">
      <h2>
        {{
          result.pagination.total === 0 &&
          !params.search &&
          !params.genre &&
          !params.platform &&
          !params.status
            ? "Каталог пуст"
            : "Игры не найдены"
        }}
      </h2>
      <p>Попробуйте изменить поиск или фильтры.</p>
      <button class="button button--outline" @click="resetFilters">
        Сбросить фильтры
      </button>
    </div>
    <template v-else
      ><div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Игра</th>
              <th>Жанр / платформа</th>
              <th>Дата выхода</th>
              <th>Статус</th>
              <th><span class="sr-only">Действия</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in result.items" :key="game.id">
              <td>
                <div class="game-cell">
                  <GameCover :game="game" />
                  <div>
                    <RouterLink :to="`/games/${game.id}`">{{
                      game.title
                    }}</RouterLink
                    ><small
                      >Добавлено
                      {{
                        new Date(game.createdAt).toLocaleDateString("ru-RU")
                      }}</small
                    >
                  </div>
                </div>
              </td>
              <td>
                {{ game.genre }}<small>{{ game.platform }}</small>
              </td>
              <td>
                {{ new Date(game.releaseDate).toLocaleDateString("ru-RU") }}
              </td>
              <td>
                <span class="badge" :class="game.status">{{
                  game.status === "published" ? "Опубликовано" : "Черновик"
                }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <RouterLink
                    :to="`/games/${game.id}/edit`"
                    :aria-label="`Редактировать ${game.title}`"
                    >Изменить</RouterLink
                  ><button
                    :aria-label="`Удалить ${game.title}`"
                    @click="target = game"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="mobile-cards">
        <li v-for="game in result.items" :key="game.id">
          <GameCover :game="game" />
          <div>
            <span class="badge" :class="game.status">{{
              game.status === "published" ? "Опубликовано" : "Черновик"
            }}</span>
            <h2>
              <RouterLink :to="`/games/${game.id}`">{{
                game.title
              }}</RouterLink>
            </h2>
            <p>{{ game.genre }} · {{ game.platform }}</p>
            <div class="row-actions">
              <RouterLink :to="`/games/${game.id}/edit`">Изменить</RouterLink
              ><button @click="target = game">Удалить</button>
            </div>
          </div>
        </li>
      </ul></template
    >
    <div v-if="result && result.pagination.total" class="pagination">
      <label
        >На странице
        <select
          :value="params.limit"
          @change="setParam('limit', $event.target.value)"
        >
          <option>5</option>
          <option>10</option>
          <option>20</option>
        </select></label
      >
      <div>
        <button
          class="button button--outline"
          :disabled="Number(params.page) <= 1"
          @click="setParam('page', String(Number(params.page) - 1))"
        >
          Назад</button
        ><span
          >{{ result.pagination.page }} / {{ result.pagination.pages }}</span
        ><button
          class="button button--outline"
          :disabled="Number(params.page) >= result.pagination.pages"
          @click="setParam('page', String(Number(params.page) + 1))"
        >
          Далее
        </button>
      </div>
    </div>
  </section>
  <ConfirmDialog
    :open="!!target"
    :busy="deleting"
    title="Удалить игру?"
    :message="
      target
        ? `«${target.title}» будет удалена из вашего демонстрационного каталога.`
        : ''
    "
    @close="target = null"
    @confirm="remove"
  />
</template>
