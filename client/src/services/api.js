export class ApiError extends Error {
  constructor(message, details = {}, status = 0) {
    super(message);
    this.details = details;
    this.status = status;
  }
}
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch("/api" + path, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Нет соединения с сервером. Проверьте сеть и повторите попытку.",
    );
  }
  if (response.status === 204) return null;
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Сервер вернул некорректный ответ.");
  }
  if (!response.ok)
    throw new ApiError(
      data.error?.message || "Не удалось выполнить запрос.",
      data.error?.details || {},
      response.status,
    );
  return data;
}
export const api = {
  list: (query, signal) =>
    request("/games?" + new URLSearchParams(query), { signal }),
  get: (id) => request("/games/" + id),
  stats: () => request("/stats"),
  create: (data) =>
    request("/games", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request("/games/" + id, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => request("/games/" + id, { method: "DELETE" }),
  reset: () => request("/demo/reset", { method: "POST" }),
};
