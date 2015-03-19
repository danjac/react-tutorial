import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import {Input} from 'react-bootstrap';
import UserStore from '../stores/UserStore';
import actions from '../actions';


export default React.createClass({

    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(UserStore, 'onLoginSuccess'),
        Reflux.listenTo(actions.loginFailure, 'onLoginFailure'),
    ],

    getInitialState() {
        return {
            errors: {}
        }
    },

    redirect() {
        const nextPath = this.getQuery().nextPath || "/";
        this.transitionTo(nextPath);
    },

    onLoginSuccess() {
        const user = UserStore.getDefaultData();
        if (user) {
            return this.redirect();
        }
    },

    onLoginFailure(errors) {
        this.setState({ errors: errors || {} });
    },

    handleSubmit(event) {
        event.preventDefault();

        const identity = this.refs.identity.getValue(),
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
