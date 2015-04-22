import path from 'path';
import express from 'express';
import csrf from 'csurf';
import errorhandler from 'errorhandler';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import responseTime from 'response-time';
import serveStatic from 'serve-static';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import React from 'react';
import Router from 'react-router';
import Routes from '../app/Routes';


export default function(app) {

    // session configuration
    //
    if (!process.env.SECRET_KEY) {
        throw new Error("You must set a SECRET_KEY in your environment!");
    }

    app.set('view engine', 'ejs');

    app.use(morgan('combined'));
    app.use(errorhandler({ log: true }));
    app.use(responseTime());

    app.use(bodyParser.json());
    app.use(serveStatic(path.join(__dirname, '../public')));
    app.use(cookieParser());
    app.use(csrf({ cookie: true }));
    app.use(session({ secret: process.env.SECRET_KEY }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        req.reactify = () => {
            return new Promise((resolve, reject) => {
                const router = Router.create({
                    routes: Routes,
                    location: req.url,
                    onAbort: (reason, location) => {
                        const err = new Error();
                        err.status = 302;
                        err.location = "/login?next=" + encodeURI(req.url);
                        reject(err);
                    }
                });

                router.run((Handler, state) => {
                    resolve(React.renderToString(<Handler />));
                });
            });
        };
        next();
    });

}
