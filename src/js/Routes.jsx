import React from 'react';
import Router from 'react-router';

import App from './components/App.jsx';
import Popular from './components/Popular.jsx';

const Route = Router.Route,
      RouteHandler = Router.RouteHandler,
      DefaultRoute = Router.DefaultRoute;

export default (
    <Route handler={App}>
        <DefaultRoute name="popular" handler={Popular} />
    </Route>
);

