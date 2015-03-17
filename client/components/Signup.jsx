import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import {Input} from 'react-bootstrap';
import actions from '../actions';
import * as validators from '../validators';


export default React.createClass({

    mixins: [
        Router.Navigation,
        Reflux.listenTo(actions.signupFailure, "onSignupFailure"),
        Reflux.listenTo(actions.signupSuccess, "onSignupSuccess")
    ],

    getInitialState () {
        return {
            errors: {}
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

        let validator = new validators.Signup();

        let result = validator.check({
            name: this.refs.name.getValue(),
            email: this.refs.email.getValue(),
            password: this.refs.password.getValue()
        });

        console.log(result.data, result.errors, result.ok)

        if (result.ok){
            actions.signup(result.data.name, 
                           result.data.email, 
                           result.data.password);
        } else {
            this.setState({ errors: result.errors });        
        }

    },

    render () {

        return (
            <form onSubmit={this.handleSubmit}>
               <Input ref="name" 
                      type="text" 
                      label="Name" 
                      required
                      bsStyle={this.state.errors.name? 'error': null}  
                      help={this.state.errors.name} />
               <Input ref="email" 
                      type="email" 
                      label="Email address" 
                      required
                      bsStyle={this.state.errors.email? 'error': null}  
                      help={this.state.errors.email} />
               <Input ref="password" 
                      type="password" 
                      label="Password" 
                      required
                      bsStyle={this.state.errors.password? 'error': null}  
                      help={this.state.errors.password} />
               <Input type="submit" value="Signup" />
            </form>
        );
    }

});
