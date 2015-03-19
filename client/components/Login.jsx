import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import {Input} from 'react-bootstrap';
import validator from 'validator';
import _ from 'lodash';
import UserStore from '../stores/UserStore';
import actions from '../actions';

export default React.createClass({

    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(actions.loginSuccess, 'onLoginSuccess'),
        Reflux.listenTo(actions.loginFailure, 'onLoginFailure'),
    ],

    getInitialState() {
        return {
            errors: {}
        }
    },

    redirect() {
        var nextPath = this.getQuery().nextPath || "/";
        this.transitionTo(nextPath);
    },
    
    onLoginSuccess() {
        var user = UserStore.getDefaultData();
        if (user) {
            this.redirect();
        }
    },

    onLoginFailure(errors) {
        this.setState({ errors: errors || {}});
    },

    handleSubmit(event) {
        event.preventDefault();

        var identity = this.refs.identity.getValue(),
            password = this.refs.password.getValue();

        actions.login(identity, password);

    },

    render() {

        return (

        <form onSubmit={this.handleSubmit}>
            <Input ref="identity" 
                   type="text" 
                   label="Email address or username" 
                   help={this.state.errors.identity} 
                   bsStyle={this.state.errors.identity? 'error': null} />
            <Input ref="password" 
                   type="password" 
                   label="Password" 
                   help={this.state.errors.password} 
                   bsStyle={this.state.errors.password? 'error': null} />
            <Input type="submit" value="Login" />
        </form>
        );
    }
});
