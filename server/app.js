const express = require("express");
const path = require("node:path");
const { openDatabase } = require("./database");
const { repository } = require("./repositories/games");
const { service } = require("./services/games");
const { sessionMiddleware } = require("./middleware/session");
const { writeLimit } = require("./middleware/limits");
const { controller } = require("./controllers/games");
const { routes } = require("./routes");
function createApp(db = openDatabase()) {
  const app = express();
  const repo = repository(db);
  const games = service(db, repo);
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const allowed = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    if (req.headers.origin === allowed) {
      res.set("Access-Control-Allow-Origin", allowed);
      res.set("Access-Control-Allow-Credentials", "true");
      res.set("Vary", "Origin");
    }
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }
    next();
  });
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use(
    "/api",
    express.json({ limit: "16kb" }),
    sessionMiddleware(db, repo),
    routes(controller(games), writeLimit(db)),
  );
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "../dist/index.html"), (error) => {
      if (error) next(error);
    });
  });
  app.use((req, res) =>
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Адрес не найден." } }),
  );
  app.use((error, req, res, next) => {
    if (error.type === "entity.too.large")
      return res
        .status(413)
        .json({
          error: { code: "BODY_TOO_LARGE", message: "Слишком большой запрос." },
        });
    if (error instanceof SyntaxError && error.status === 400)
      return res
        .status(400)
        .json({
          error: { code: "INVALID_JSON", message: "Некорректный JSON." },
        });
    if (error.status)
      return res
        .status(error.status)
        .json({
          error: {
            code: error.code,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        });
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({
        error: {
          code: "INTERNAL",
          message: "Ошибка сервера. Повторите попытку.",
        },
      });
  });
  return app;
}
module.exports = { createApp };
