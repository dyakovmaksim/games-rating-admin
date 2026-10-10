const fields = [
  "title",
  "description",
  "imageUrl",
  "gameUrl",
  "genre",
  "platform",
  "releaseDate",
  "status",
];
const sorts = {
  title: "unicode_lower(title) ASC",
  newest: "created_at DESC",
  oldest: "created_at ASC",
  releaseNewest: "release_date DESC",
  releaseOldest: "release_date ASC",
};
function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}
function validUrl(value, optional = false) {
  if (optional && !value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
function validateGame(input) {
  const game = Object.fromEntries(
    fields.map((field) => [field, clean(input[field])]),
  );
  const errors = {};
  if (game.title.length < 2 || game.title.length > 120)
    errors.title = "Название: от 2 до 120 символов.";
  if (game.description.length < 10 || game.description.length > 2000)
    errors.description = "Описание: от 10 до 2000 символов.";
  if (!validUrl(game.imageUrl, true) || game.imageUrl.length > 1000)
    errors.imageUrl = "Укажите ссылку http или https длиной до 1000 символов.";
  if (!validUrl(game.gameUrl) || game.gameUrl.length > 1000)
    errors.gameUrl = "Укажите ссылку http или https длиной до 1000 символов.";
  for (const field of ["genre", "platform"])
    if (!game[field] || game[field].length > 60)
      errors[field] = "Укажите значение длиной до 60 символов.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(game.releaseDate) ||
    Number.isNaN(Date.parse(game.releaseDate)) ||
    new Date(game.releaseDate).toISOString().slice(0, 10) !== game.releaseDate
  )
    errors.releaseDate = "Укажите корректную дату.";
  if (!["draft", "published"].includes(game.status))
    errors.status = "Выберите статус.";
  return { game, errors };
}
function validateQuery(input) {
  const errors = {};
  const query = {
    search: clean(input.search),
    genre: clean(input.genre),
    platform: clean(input.platform),
    status: clean(input.status),
    sort: input.sort || "newest",
    page: Number(input.page || 1),
    limit: Number(input.limit || 10),
  };
  if (query.search.length > 120) errors.search = "Поиск слишком длинный.";
  if (!Object.hasOwn(sorts, query.sort))
    errors.sort = "Неизвестная сортировка.";
  if (query.status && !["draft", "published"].includes(query.status))
    errors.status = "Неизвестный статус.";
  if (!Number.isInteger(query.page) || query.page < 1)
    errors.page = "Неверная страница.";
  if (![5, 10, 20].includes(query.limit))
    errors.limit = "Неверное количество записей.";
  for (const key of ["genre", "platform"])
    if (query[key].length > 60) errors[key] = "Слишком длинное значение.";
  return { query, errors };
}
module.exports = { validateGame, validateQuery, sorts };
