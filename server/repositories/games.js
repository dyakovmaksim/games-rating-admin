const { sorts } = require('../validation/games')
const columns = 'id, title, description, image_url AS imageUrl, game_url AS gameUrl, genre, platform, release_date AS releaseDate, status, created_at AS createdAt, updated_at AS updatedAt'
const insert = 'INSERT INTO games (session_id,title,normalized_title,description,image_url,game_url,genre,platform,release_date,status,created_at,updated_at) VALUES (@sessionId,@title,@normalizedTitle,@description,@imageUrl,@gameUrl,@genre,@platform,@releaseDate,@status,@createdAt,@updatedAt)'
function repository(db) {
  function get(sessionId, id) { return db.prepare(`SELECT ${columns} FROM games WHERE session_id = ? AND id = ?`).get(sessionId, id) }
  function list(sessionId, query) {
    const where = ['session_id = @sessionId']
    const params = { sessionId, search: `%${query.search.toLocaleLowerCase('ru').replace(/[\\%_]/g, '\\$&')}%`, genre: query.genre, platform: query.platform, status: query.status }
    if (query.search) where.push("unicode_lower(title) LIKE @search ESCAPE '\\'")
    for (const key of ['genre','platform','status']) if (query[key]) where.push(`${key} = @${key}`)
    const condition = where.join(' AND ')
    const total = db.prepare(`SELECT count(*) AS count FROM games WHERE ${condition}`).get(params).count
    const items = db.prepare(`SELECT ${columns} FROM games WHERE ${condition} ORDER BY ${sorts[query.sort]}, id DESC LIMIT @limit OFFSET @offset`).all({ ...params, limit: query.limit, offset: (query.page - 1) * query.limit })
    return { items, pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) } }
  }
  function create(sessionId, game, now = new Date().toISOString()) {
    const info = db.prepare(insert).run({ sessionId, ...game, normalizedTitle: game.title.toLocaleLowerCase('ru'), createdAt: now, updatedAt: now })
    return get(sessionId, info.lastInsertRowid)
  }
  function update(sessionId, id, game) {
    db.prepare('UPDATE games SET title=@title, normalized_title=@normalizedTitle, description=@description, image_url=@imageUrl, game_url=@gameUrl, genre=@genre, platform=@platform, release_date=@releaseDate, status=@status, updated_at=@updatedAt WHERE id=@id AND session_id=@sessionId').run({ ...game, normalizedTitle: game.title.toLocaleLowerCase('ru'), id, sessionId, updatedAt: new Date().toISOString() })
    return get(sessionId, id)
  }
  function remove(sessionId, id) { return db.prepare('DELETE FROM games WHERE session_id = ? AND id = ?').run(sessionId, id).changes > 0 }
  function count(sessionId) { return db.prepare('SELECT count(*) AS count FROM games WHERE session_id = ?').get(sessionId).count }
  function stats(sessionId) {
    const counts = db.prepare("SELECT count(*) AS total, sum(status = 'published') AS published, sum(status = 'draft') AS drafts FROM games WHERE session_id = ?").get(sessionId)
    return { total: counts.total, published: counts.published || 0, drafts: counts.drafts || 0,
      genres: db.prepare('SELECT genre, count(*) AS count FROM games WHERE session_id = ? GROUP BY genre ORDER BY count DESC, genre').all(sessionId),
      recent: db.prepare(`SELECT ${columns} FROM games WHERE session_id = ? ORDER BY created_at DESC, id DESC LIMIT 5`).all(sessionId),
      genresOptions: db.prepare('SELECT DISTINCT genre FROM games WHERE session_id = ? ORDER BY genre').all(sessionId).map(row => row.genre),
      platformsOptions: db.prepare('SELECT DISTINCT platform FROM games WHERE session_id = ? ORDER BY platform').all(sessionId).map(row => row.platform) }
  }
  return { get, list, create, update, remove, count, stats }
}
module.exports = { repository }
