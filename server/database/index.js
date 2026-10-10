const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");
function openDatabase(
  file = process.env.DATABASE_PATH || "./data/gamedesk.sqlite",
) {
  if (file !== ":memory:")
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new Database(file);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.function("unicode_lower", (value) =>
    String(value).toLocaleLowerCase("ru"),
  );
  db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  if (
    !db
      .pragma("table_info(games)")
      .some((column) => column.name === "normalized_title")
  ) {
    db.exec(
      "ALTER TABLE games ADD COLUMN normalized_title TEXT NOT NULL DEFAULT ''",
    );
    db.prepare(
      "UPDATE games SET normalized_title = unicode_lower(trim(title))",
    ).run();
  }
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS games_unique_normalized_title ON games(session_id, normalized_title)",
  );
  return db;
}
module.exports = { openDatabase };
