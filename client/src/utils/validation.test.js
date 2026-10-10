import { describe, it, expect } from "vitest";
import { validateGame } from "./validation";
const good = {
  title: "  New Game  ",
  description: "  Достаточно длинное описание игры.  ",
  imageUrl: "",
  gameUrl: "https://example.com/game",
  genre: "  Экшен ",
  platform: " PC ",
  releaseDate: "2024-02-29",
  status: "draft",
};
describe("форма игры", () => {
  it("очищает пробелы и принимает корректные поля", () => {
    const result = validateGame(good);
    expect(result.errors).toEqual({});
    expect(result.game.title).toBe("New Game");
  });
  it("отклоняет неверные ссылки и короткое описание", () => {
    const result = validateGame({
      ...good,
      description: "коротко",
      gameUrl: "javascript:alert(1)",
      imageUrl: "ftp://example.com/file",
    });
    expect(result.errors.gameUrl).toBeTruthy();
    expect(result.errors.imageUrl).toBeTruthy();
    expect(result.errors.description).toBeTruthy();
  });
});
