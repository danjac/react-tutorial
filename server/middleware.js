import React from 'react';
import Router from 'react-router';

export function reactify(routes) {

    return (req, res, next) => {

        res.reactify = (route, props, opts) => {

            props = props || {};
            opts = opts = {};

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