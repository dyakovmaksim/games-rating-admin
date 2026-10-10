import { describe, it, expect, vi, afterEach } from "vitest";
import { request, ApiError } from "./api";
afterEach(() => vi.unstubAllGlobals());
describe("запросы API", () => {
  it("сообщает о сетевой ошибке без обращения к отсутствующему ответу", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(request("/games")).rejects.toBeInstanceOf(ApiError);
    await expect(request("/games")).rejects.toThrow("Нет соединения");
  });
  it("передаёт серверные ошибки формы", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 409,
          json: async () => ({
            error: { message: "Дубликат", details: { title: "Занято" } },
          }),
        }),
    );
    await expect(request("/games")).rejects.toMatchObject({
      message: "Дубликат",
      details: { title: "Занято" },
      status: 409,
    });
  });
});
