var React = require('react'),
    Router = require('react-router');

module.exports = {

    reactify: function(routes) {

        return function(req, res, next) {

            res.reactify = function(route, props, opts){

                props = props || {};
                opts = opts = {};

                props.isServer = true;

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
