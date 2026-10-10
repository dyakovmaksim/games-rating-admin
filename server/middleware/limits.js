const { fail } = require("../services/games");
function writeLimit(db) {
  return (req, res, next) => {
    try {
      const now = Date.now();
      const row = db
        .prepare("SELECT last_write FROM sessions WHERE id = ?")
        .get(req.sessionId);
      if (now - row.last_write < 750)
        fail(
          429,
          "RATE_LIMIT",
          "Подождите секунду перед следующим изменением.",
        );
      db.prepare("UPDATE sessions SET last_write = ? WHERE id = ?").run(
        now,
        req.sessionId,
      );
      next();
    } catch (error) {
      next(error);
    }
  };
}
module.exports = { writeLimit };
