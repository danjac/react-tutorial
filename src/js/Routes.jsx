var React = require('react'),
    {DefaultRoute, Route} = require('react-router'),
    App = require('./components/App'),
    Popular = require('./components/Popular'),
    Latest = require('./components/Latest'),
    Login = require('./components/Login'),
    Signup = require('./components/Signup'),
    Submit = require('./components/Submit');
 
module.exports = (
    <Route handler={App}>
        <DefaultRoute name="popular" handler={Popular} />
        <Route name="latest" path="latest" handler={Latest} />
        <Route name="login" path="login" handler={Login} />
        <Route name="signup" path="signup" handler={Signup} />
        <Route name="submit" path="submit" handler={Submit} />
    </Route>
);

