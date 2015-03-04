var  React = require('react'),
     Router = require('react-router'),
     App = require('./components/App'),
     Popular = require('./components/Popular'),
     Latest = require('./components/Latest'),
     Login = require('./components/Login'),
     {DefaultRoute, Route} = Router;
 
module.exports = (
    <Route handler={App}>
        <DefaultRoute name="popular" handler={Popular} />
        <Route name="latest" path="latest" handler={Latest} />
        <Route name="login" path="login" handler={Login} />
    </Route>
);

