function controller(games) {
  const handle = fn => (req, res, next) => { try { fn(req, res) } catch (error) { next(error) } }
  return {
    list: handle((req, res) => res.json(games.list(req.sessionId, req.query))),
    get: handle((req, res) => res.json(games.requireGame(req.sessionId, req.params.id))),
    create: handle((req, res) => res.status(201).json(games.save(req.sessionId, req.body))),
    update: handle((req, res) => res.json(games.save(req.sessionId, req.body, req.params.id))),
    remove: handle((req, res) => { games.remove(req.sessionId, req.params.id); res.status(204).end() }),
    stats: handle((req, res) => res.json(games.stats(req.sessionId))),
    reset: handle((req, res) => res.json(games.reset(req.sessionId)))
  }
}
module.exports = { controller }
