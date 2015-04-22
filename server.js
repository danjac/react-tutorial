import dotenv from 'dotenv';
import express from 'express';
import configure from './config';
import models from './src/models';

dotenv.load();

const app = express();

configure(app);

// sync DB
//
models.sequelize.sync().then(() => {
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
        const address = server.address();
        console.log("Listening at %s:%s", address.address, address.port);
    });
});
