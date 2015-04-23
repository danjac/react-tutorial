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
import bootstrap from '../app/bootstrap';


export default function(app) {

    // session configuration
    //
    if (!process.env.SECRET_KEY) {
        throw new Error("You must set a SECRET_KEY in your environment!");
    }

    app.set('view engine', 'ejs');

    app.use(responseTime());
    app.use(morgan('combined'));
    app.use(errorhandler({ log: true }));

    app.use(bodyParser.json());
    app.use(serveStatic(path.join(__dirname, '../public')));
    app.use(cookieParser());
    app.use(csrf({ cookie: true }));
    app.use(session({ secret: process.env.SECRET_KEY }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        res.reactify = (data) => {

            console.log(req.url, "XHR?", req.xhr);
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json(data);
            }
            const user = req.user || null;

            data = data || {};
            data.user = user;

            new Promise((resolve, reject) => {
                const router = Router.create({
                    routes: Routes,
                    location: req.url,
                    onAbort: (reason, location) => {
                        const url = "/login?next=" + encodeURI(req.url);
                        res.redirect(url);
                    }
                });

                bootstrap(data);

                router.run((Handler, state) => {
                    resolve(React.renderToString(<Handler />));
                });
            })
            .then((component) => {

                const appjs = process.env.NODE_ENV === 'development'? 'http://localhost:8080/js/app.js' : '/js/app.js';

                res.render('index', {
                    component: component,
                    csrfToken: req.csrfToken(),
                    appjs: appjs,
                    initData: JSON.stringify(data)
                });
            })
            .catch((err) => next(err));
        };
        next();
    });

}
