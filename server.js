import path from 'path';
import koa from 'koa';
import body from 'koa-bodyparser';
import logger from 'koa-logger';
import error from 'koa-error';
import render from 'koa-ejs';
import session from 'koa-generic-session';
import serveStatic from 'koa-static';
import dotenv from 'dotenv';
import passport from 'koa-passport';
import _ from 'lodash';
import Checkit from 'checkit';
import connect from './config/db';
import routes from './config/routes';
import auth from './config/auth';

dotenv.load();

const app = koa();

// all environments

const port = process.env.PORT || 5000;
const devMode = 'development' === process.env.NODE_ENV;

// common middleware
//
//


render(app, {
    root: path.join(__dirname, 'views'),
    layout: false,
    viewExt: 'ejs',
    cache: !(devMode),
    debug: devMode
});

app.keys = [process.env.SECRET_KEY];
app.use(body());

app.use(serveStatic(path.join(__dirname, 'public')));

app.use(logger());


// development only
if (devMode) {
    console.log("Using development environment");
    //app.use(errorHandler())
}

console.log("connecting to mongodb");
connect();

  
// handle form input and other user errors

app.use(function* (next) {
    try {
        yield next;
    } catch(err) {
        if (err instanceof Checkit.Error) {
            this.status = 400;
            this.body = err.toJSON();
            return;
        }
        if (err.status && err.status < 500) {
            this.status = err.status;
            return;
        } 
        throw err;
    }
});

app.use(error());

// authentication

app.use(session({ key: 'react-tutorial' }));
app.use(passport.initialize());
app.use(passport.session());

auth(passport);


//
// Set up routes
//
routes(app);


// run server

console.log("Running on port", port);
app.listen(port);
