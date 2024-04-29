const gamesRouter = require("express").Router();
const { getAllGames, deleteGame } = require("../controllers/games");

gamesRouter.get("/games", getAllGames)
gamesRouter.delete("/games/:id", deleteGame);

module.exports = gamesRouter;