import React from 'react';
import Router from 'react-router';
import _ from 'lodash';
import Checkit from 'checkit';
import {NotAuthenticated} from './errors';


export function authenticate(db) {

    return (req, res, next) => {

        const err = new NotAuthenticated("You are not signed in");

        if (!req.authToken || !req.authToken.id) {
            return next(err);
        }
        db("users")
            .where("id", req.authToken.id)
            .first("id", "name", "email", "votes")
            .then((user) => {
                if (!user) {
                    return next(err);
                }
                req.user = user;
                next();
            }, (err) => next(err));
    };
};


export function validates(validator) {

    return (req, res, next) => {
        
        validator.run(req.body)
            .then((data) => {
                req.clean = data;
                next();
            })
            .catch(Checkit.Error, (err) => {
                res.status(400).json(err.toJSON());
            });
    };
};


export function reactify(routes) {

    return (req, res, next) => {

        res.reactify = (route, props={}, opts={}) => {

            const router = Router.create({
                routes: routes,
                location: route,
                onError: (err) => next(err),
                onAbort: (abortReason) => {
                    if (abortReason.constructor.name === 'Redirect') {
                        const url = router.makePath(
                            abortReason.to, 
                            abortReason.params, 
                            abortReason.query
                        );
                        res.redirect(url);
                    } else {
                        next(abortReason);
                    }
                }
            });

            router.run((Handler, state) => {
                res.render(opts.template || 'index', {
                    markup: React.renderToString(Handler(props)),
                    data: JSON.stringify(props)
                });
            });
        };

        next();
    };
};
