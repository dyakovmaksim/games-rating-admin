const { randomBytes } = require("node:crypto");
const { seedGames } = require("../database/seed");
function sessionMiddleware(db, games) {
  const days = Math.max(1, Number(process.env.SESSION_DAYS || 7));
  const duration = days * 86400000;
  const insertSeed = db.transaction((id) =>
    seedGames.forEach((game, index) =>
      games.create(
        id,
        game,
        new Date(Date.now() - (seedGames.length - index) * 60000).toISOString(),
      ),
    ),
  );
  return function session(req, res, next) {
    try {
      const now = Date.now();
      if (Math.random() < 0.01)
        db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
      const cookie = req.headers.cookie
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("gamedesk_session="))
        ?.split("=")[1];
      const existing =
        /^[a-f0-9]{64}$/.test(cookie || "") &&
        db
          .prepare("SELECT id FROM sessions WHERE id = ? AND expires_at > ?")
          .get(cookie, now);
      const id = existing ? cookie : randomBytes(32).toString("hex");
      if (!existing) {
        db.prepare("INSERT INTO sessions (id, expires_at) VALUES (?, ?)").run(
          id,
          now + duration,
        );
        insertSeed(id);
      } else
        db.prepare("UPDATE sessions SET expires_at = ? WHERE id = ?").run(
          now + duration,
          id,
        );
      res.cookie("gamedesk_session", id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE === "true",
        maxAge: duration,
        path: "/",
      });
      req.sessionId = id;
      next();
    } catch (error) {
      next(error);
    }
  };
}
module.exports = { sessionMiddleware };
