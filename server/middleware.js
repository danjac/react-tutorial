import React from 'react';
import Router from 'react-router';
import _ from 'lodash';
import {NotAuthenticated} from './errors';


export function authenticate(db) {

    return (req, res, next) => {

        const err = new NotAuthenticated("You are not signed in");

        if (!req.authToken) {
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


export function validates(...validators) {

    return (req, res, next) => {
        
        validators.forEach((validator) => {
            if (validator.async) {
                validator.validateAsync(req.body).then((result) => {
                    if (!result.ok) {
                        return res.status(400).json(result.errors);
                    }
                    req.clean = result.data;
                    next();
                }, (err) => next(err));
            } else {
                let result = validator.validate(req.body);
                if (!result.ok) {
                    return res.status(400).json(result.body);
                }
                req.clean = _.assign(req.clean || {}, result.data);
                next();
            }
        });
    }
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
