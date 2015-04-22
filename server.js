import dotenv from 'dotenv';
import express from 'express';
import configure from './config';
import models from './src/models';

dotenv.load();

const app = express();

configure(app);

// run server

const port = process.env.PORT || 5000;
console.log("Running on port", port);

// sync DB
//
models.sequelize.sync().then(() => {
    const server = app.listen(port, () => {
        const address = server.address();
        console.log("Listening at %s:%s", address.host, address.port);
    });
});
