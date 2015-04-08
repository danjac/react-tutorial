import path from 'path';
import serveStatic from 'koa-static';
import body from 'koa-bodyparser';
import logger from 'koa-logger';
import error from 'koa-error';
import render from 'koa-ejs';
import Checkit from 'checkit';
import passport from 'koa-passport';
import session from 'koa-generic-session';


export default function(app) {

    const devMode = app.env === 'development';

    // session configuration
    if (!process.env.SECRET_KEY) {
        throw new Error("You must set a SECRET_KEY in your environment!")
    }
    app.keys = [process.env.SECRET_KEY];
    app.use(session({ key: 'react-tutorial' }));

    // authentication

    app.use(passport.initialize());
    app.use(passport.session());

    // body parser
    //
    app.use(body());

    render(app, {
        root: path.join(__dirname, '../views'),
        layout: false,
        viewExt: 'ejs',
        cache: !(devMode),
        debug: devMode
    });

    if (devMode) {
        app.use(serveStatic(path.join(__dirname, '../public')));
    }

    // logging
    app.use(logger());
    //

    // error handling
    //
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

}
