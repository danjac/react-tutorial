import dotenv from 'dotenv';
dotenv.load();


import koa from 'koa';
import configure from './config';
import models from './lib/models';


const app = koa();
configure(app);

// run server


const port = process.env.PORT || 5000;
console.log("Running on port", port);

models.sequelize.sync().then(() => {
    app.listen(port);
});
