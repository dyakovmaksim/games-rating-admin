const fs = require('node:fs')
const path = require('node:path')
const extra = [
  ['Celeste','Платформер','PC','2018-01-25','published'],['Hollow Knight','Метроидвания','PC','2017-02-24','published'],
  ['Stardew Valley','Симулятор','PC','2016-02-26','published'],['Hades','Экшен','PC','2020-09-17','published'],
  ['Portal 2','Головоломка','PC','2011-04-19','published'],['Journey','Приключение','PlayStation','2012-03-13','published'],
  ['Gris','Платформер','Nintendo Switch','2018-12-13','published'],['Outer Wilds','Приключение','Xbox','2019-05-28','published'],
  ['Dead Cells','Экшен','Nintendo Switch','2018-08-07','published'],['Disco Elysium','Ролевая игра','PC','2019-10-15','published'],
  ['Tunic','Приключение','Xbox','2022-03-16','draft'],['Sable','Приключение','PC','2021-09-23','draft'],
  ['Inside','Головоломка','PlayStation','2016-06-29','published'],['Spiritfarer','Симулятор','Nintendo Switch','2020-08-18','draft'],
  ['Cuphead','Экшен','Xbox','2017-09-29','published'],['Baba Is You','Головоломка','PC','2019-03-13','draft'],
  ['A Short Hike','Приключение','Nintendo Switch','2019-04-05','published']
]
const old = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/games.json'), 'utf8'))
const source = old.map(game => ({ title: game.title, description: `${game.description || ''} (учебная запись из исходного проекта)`, imageUrl: game.image, gameUrl: game.link, genre: 'Другое', platform: 'Web', releaseDate: '2024-01-01', status: 'draft' }))
const demo = extra.map(([title, genre, platform, releaseDate, status]) => ({ title, genre, platform, releaseDate, status, description: `${title} — демонстрационная запись каталога GameDesk. Данные служат для проверки поиска, фильтров и редактирования.`, imageUrl: '', gameUrl: 'https://www.igdb.com/search?type=1&q=' + encodeURIComponent(title) }))
module.exports = { seedGames: [...source, ...demo] }
