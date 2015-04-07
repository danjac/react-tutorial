import React from 'react';
import {DefaultRoute, Route} from 'react-router';

import App from './components/App';
import Popular from './components/Popular';
import Latest from './components/Latest';
import User from './components/User';
import Login from './components/Login';
import Signup from './components/Signup';
import Submit from './components/Submit';
import Search from './components/Search';
 

export default (
    <Route handler={App}>
        <DefaultRoute name="popular" handler={Popular} />
        <Route name="latest" path="/latest" handler={Latest} />
        <Route name="user" path="/user/:name" handler={User} />
        <Route name="login" path="/login" handler={Login} />
        <Route name="signup" path="/signup" handler={Signup} />
        <Route name="submit" path="/submit" handler={Submit} />
        <Route name="search" path="/search" handler={Search} />
    </Route>
);

