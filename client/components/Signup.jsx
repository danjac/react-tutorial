import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import Immutable from 'immutable';
import {Input} from 'react-bootstrap';
import actions from '../actions';
import validators from '../validators';

export default React.createClass({

    mixins: [
        Router.Navigation,
        Reflux.listenTo(actions.signupFailure, "onSignupFailure"),
        Reflux.listenTo(actions.signupSuccess, "onSignupSuccess")
    ],

    getInitialState () {
        return {
            errors: Immutable.Map()
        };
    },

    onSignupSuccess () {
        this.transitionTo(this.makeHref("submit"));
    },

    onSignupFailure (errors) {
        this.setState({ errors: errors });
    },

    handleSubmit (event) {
        event.preventDefault();
        
        const name = this.refs.name.getValue(),
              email = this.refs.email.getValue(),
              password = this.refs.password.getValue(),
              errors = validators.signup(name, email, password);

        if (!errors.isEmpty()){
            this.setState({ errors: errors });
            return;
        }

        actions.signup(name, email, password);
    },

    render () {

        return (
            <form onSubmit={this.handleSubmit}>
               <Input ref="name" 
                      type="text" 
                      label="Name" 
                      required
                      bsStyle={this.state.errors.has("name")? 'error': null}  
                      help={this.state.errors.get("name", "")} />
               <Input ref="email" 
                      type="email" 
                      label="Email address" 
                      required
                      bsStyle={this.state.errors.has("email")? 'error': null}  
                      help={this.state.errors.get("email", "")} />
               <Input ref="password" 
                      type="password" 
                      label="Password" 
                      required
                      bsStyle={this.state.errors.has("password")? 'error': null}  
                      help={this.state.errors.get("password", "")} />
               <Input type="submit" value="Signup" />
            </form>
        );
    }

});
