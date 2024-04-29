const { readData, writeData } = require("../utils/data");


const getAllGames = async (req, res) => {
    const games = await readData("./data/games.json");
    if (!games) {
        res.status(400);
        res.send({
            status: "error",
            message: "Нет игр в базе данных. Добавьте игру."
        });
        return;
    }
    req.games = games;
    res.send(req.games);
};

const deleteGame = async (req, res) => {
    const games = await readData("./data/games.json");
    if (!games) {
        res.status(400);
        res.send({
            status: "error",
            message: "Нет игр в базе данных. Добавьте игру.",
        });
        return;
    }
    req.games = games;

    const id = Number(req.params.id);

    req.game = req.games.find((item) => item.id === id);

    const index = req.games.findIndex((item) => item.id === req.game.id);

    req.games.splice(index, 1);

    await writeData("./data/games.json", req.games);

    res.send({
        games: req.games,
        updated: req.game
    });
}

module.exports = {
    getAllGames,
    deleteGame
}