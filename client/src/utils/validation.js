export const blankGame = () => ({
  title: "",
  description: "",
  imageUrl: "",
  gameUrl: "",
  genre: "",
  platform: "",
  releaseDate: "",
  status: "draft",
});
export function normalizeGame(input) {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => Object.hasOwn(blankGame(), key))
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value,
      ]),
  );
}
function validUrl(value, optional = false) {
  if (optional && !value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
export function validateGame(input) {
  const game = normalizeGame(input);
  const errors = {};
  if (game.title.length < 2 || game.title.length > 120)
    errors.title = "От 2 до 120 символов.";
  if (game.description.length < 10 || game.description.length > 2000)
    errors.description = "От 10 до 2000 символов.";
  if (!validUrl(game.imageUrl, true) || game.imageUrl.length > 1000)
    errors.imageUrl = "Ссылка должна начинаться с http или https.";
  if (!validUrl(game.gameUrl) || game.gameUrl.length > 1000)
    errors.gameUrl = "Ссылка должна начинаться с http или https.";
  for (const key of ["genre", "platform"])
    if (!game[key] || game[key].length > 60)
      errors[key] = "Укажите значение длиной до 60 символов.";
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
