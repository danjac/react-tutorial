import path from 'path';
import koa from 'koa';
import body from 'koa-body';
import logger from 'koa-logger';
import error from 'koa-error-handler';
import render from 'koa-ejs';
import jwt from 'koa-jwt';
import serveStatic from 'koa-static';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import _ from 'lodash';
import Checkit from 'checkit';
import {connect} from './lib/models';
import routes from './config/routes';

dotenv.load();

const app = koa();

// all environments

const port = process.env.PORT || 5000;
const devMode = 'development' === process.env.NODE_ENV;

// common middleware
//
//

error(app);

render(app, {
    root: path.join(__dirname, 'views'),
    layout: false,
    viewExt: 'ejs',
    cache: !(devMode),
    debug: devMode
});

app.use(body());

app.use(serveStatic(path.join(__dirname, 'public')));

app.use(logger());

app.use(jwt({
    secret: process.env.SECRET_KEY,
    passthrough: true,
    key: 'authToken'
}));


// development only
if (devMode) {
    console.log("Using development environment");
    //app.use(errorHandler())
}

console.log("connecting to mongodb");
connect();

  
// handle errors

app.use(function* (next) {
    try {
        yield next;
    } catch(err) {
        // return any 4xx errors as-is
        // how to turn off logging?

        if (err instanceof Checkit.Error) {
            this.status = 400;
            this.body = err.toJSON();
            return this.app.emit('error', err, this);
        }
        if (err.status && err.status !== 500) {
            this.status = err.status;
            if (err.errors) {
                this.body = err.errors;
            } else {
                this.body = err.toString();
            }
            this.app.emit('error', err, this);
        } else {
            throw err;
        }
    }
});
/*
app.on('error', (err) => {
    if (process.env.NODE_ENV === 'test'){
        return;
    }
    if (err.status && err.status !== 500) {
        return; 
    }
    console.log(err);
});
*/

//
// Set up routes
//
routes(app);

// run server

console.log("Running on port", port);
app.listen(port);
