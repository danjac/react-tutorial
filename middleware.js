var React = require('react'),
    Router = require('react-router');

module.exports = {

    jwtToken: function(jwt) {

        return function(req, res, next) {
            req.jwt = jwt;
            next();
        };
    },

    authenticate: function(db) {
        return function(req, res, next) {
            var unauthenticated = function() {
                if (required) {
                    return res.sendStatus(401);
                } 
                return next();
            }

            if (!req.authToken) {
                return unauthenticated();
            }
            db("users")
                .where("id", req.authToken.id)
                .first().then(function(user) {
                    if (!user) {
                        return unauthenticated();
                    }
                    req.user = user;
                    next();
                });
        };
    },

    dbConnection: function(db) {
        return function(req, res, next) {
            req.db = db;
            next();
        };
    },

    reactify: function(routes) {

        return function(req, res, next) {

            res.reactify = function(route, props, opts){

                props = props || {};
                opts = opts = {};

                var router = Router.create({
                    routes: routes,
                    location: route,
                    onError: function(err) {
                        next(err);
                    },
                    onAbort: function(abortReason) {
                        if (abortReason.constructor.name === 'Redirect') {
                            var url = router.makePath(
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

                router.run(function(Handler, state) {
                    res.render(opts.template || 'index', {
                        markup: React.renderToString(Handler(props)),
                        data: JSON.stringify(props)
                    });
                });
            };

            next();
        };
    }
};
