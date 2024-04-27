const express = require('express');
const mainRoute = require('./routes/main');
const gamesRouter = require('./routes/games');

const PORT = 3000;
const app = express();

app.use(mainRoute, gamesRouter);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
}) 