import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import OverviewPage from "./pages/OverviewPage.vue";
import CatalogPage from "./pages/CatalogPage.vue";
import FormPage from "./pages/FormPage.vue";
import DetailPage from "./pages/DetailPage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";
import "./styles/main.scss";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: OverviewPage },
    { path: "/games", component: CatalogPage },
    { path: "/games/new", component: FormPage },
    { path: "/games/:id/edit", component: FormPage },
    { path: "/games/:id", component: DetailPage },
    { path: "/:pathMatch(.*)*", component: NotFoundPage },
  ],
});
createApp(App).use(router).mount("#app");
