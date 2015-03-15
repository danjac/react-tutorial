import express from 'express';
import http from 'http';
import path from 'path';
import errorHandler from 'errorhandler';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import serveStatic from 'serve-static';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import dotenv from 'dotenv';
import knex from 'knex';
import routes from './server/routes';
import {reactify} from './server/middleware';
import jsxRoutes from './client/Routes';

dotenv.load();

const app = express();

// all environments

const port = process.env.PORT || 5000

app.set('port', port);
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(serveStatic(path.join(__dirname, '/public')));

app.use(expressJwt({
    secret: process.env.SECRET_KEY,
    credentialsRequired: false,
    requestProperty: 'authToken'
}).unless({ path: ["/public"]}));


const devMode = 'development' == app.get('env');

// development only
if (devMode) {
    console.log("Using development environment");
    app.use(errorHandler());
}

// database 
//

const db = knex({
    client: 'pg',
    debug: devMode,
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

// Local middleware
//
app.use(reactify(jsxRoutes));

// Set up routes
//
routes(app, db);
   
// handle errors
app.use((err, req, res, next) => {
    if (err.status){
        var resp = res.status(err.status);
        if (err.payload){
            return resp.json(err.payload);
        } 
        return resp.send(err.message);
    }
    next(err);
})

// run server

console.log("Running on port", port);
app.server = http.createServer(app);
app.server.listen(port);
