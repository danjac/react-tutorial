import path from 'path';
import express from 'express';
import csrf from 'csurf';
import notifier from 'node-notifier';
import errorhandler from 'errorhandler';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
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

    const errNotify = (err, str, req) => {
        const title = `Error in ${req.method} : ${req.url}`;
        notifier.notify({
            title: title,
            message: str
        });
    };

    if (process.env.NODE_ENV === 'development') {
        app.use(errorhandler({ log: errNotify }));
    }

    app.set('view engine', 'ejs');

    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(csrf({ cookie: true }));

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
    });

}
