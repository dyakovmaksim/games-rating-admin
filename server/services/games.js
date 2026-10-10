const { validateGame, validateQuery } = require('../validation/games')
function fail(status, code, message, details) { const error = new Error(message); Object.assign(error, { status, code, details }); throw error }
function service(db, games) {
  function id(value) { if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) fail(400, 'INVALID_ID', 'Некорректный ID игры.'); return Number(value) }
  function requireGame(sessionId, rawId) { const game = games.get(sessionId, id(rawId)); if (!game) fail(404, 'NOT_FOUND', 'Игра не найдена.'); return game }
  function list(sessionId, input) { const { query, errors } = validateQuery(input); if (Object.keys(errors).length) fail(400, 'VALIDATION', 'Некорректные параметры списка.', errors); return games.list(sessionId, query) }
  function save(sessionId, input, rawId) {
    const previous = rawId ? requireGame(sessionId, rawId) : null
    const { game, errors } = validateGame(rawId ? { ...previous, ...input } : input)
    if (Object.keys(errors).length) fail(400, 'VALIDATION', 'Проверьте поля формы.', errors)
    if (!previous && games.count(sessionId) >= 50) fail(429, 'LIMIT', 'В демонстрации можно хранить не больше 50 игр.')
    try { return previous ? games.update(sessionId, previous.id, game) : games.create(sessionId, game) }
    catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') fail(409, 'DUPLICATE', 'Игра с таким названием уже есть.', { title: 'Название уже занято.' }); throw error }
  }
  function remove(sessionId, rawId) { const game = requireGame(sessionId, rawId); games.remove(sessionId, game.id); return game }
  function reset(sessionId) {
    const { seedGames } = require('../database/seed')
    db.transaction(() => { db.prepare('DELETE FROM games WHERE session_id = ?').run(sessionId); seedGames.forEach((game, index) => games.create(sessionId, game, new Date(Date.now() - (seedGames.length - index) * 60000).toISOString())) })()
    return { restored: seedGames.length }
  }
  return { id, requireGame, list, save, remove, reset, stats: games.stats }
}
module.exports = { service, fail }
