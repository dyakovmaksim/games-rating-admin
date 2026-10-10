const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { openDatabase } = require('../database')
const { repository } = require('../repositories/games')

test('SQLite сохраняет запись после закрытия и повторного открытия', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gamedesk-'))
  const file = path.join(directory, 'catalog.sqlite')
  try {
    let db = openDatabase(file)
    db.prepare('INSERT INTO sessions (id, expires_at) VALUES (?, ?)').run('test', Date.now() + 60000)
    const game = repository(db).create('test', {
      title: 'Сохранённая игра',
      description: 'Описание для проверки сохранения.',
      imageUrl: '',
      gameUrl: 'https://example.com/game',
      genre: 'Экшен',
      platform: 'PC',
      releaseDate: '2024-01-01',
      status: 'draft',
    })
    db.close()
    db = openDatabase(file)
    assert.equal(repository(db).get('test', game.id).title, 'Сохранённая игра')
    db.close()
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
