var React = require('react'),
    Router = require('react-router');

module.exports = {

    reactify(routes) {

        return (req, res, next) => {

            res.reactify = (route, props, opts) => {

                props = props || {};
                opts = opts = {};

                var router = Router.create({
                    routes: routes,
                    location: route,
                    onError: (err) => next(err),
                    onAbort: (abortReason) => {
                        if (abortReason.constructor.name === 'Redirect') {
                            let url = router.makePath(
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
    }
};
