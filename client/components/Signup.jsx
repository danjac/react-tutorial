var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    {Input} = require('react-bootstrap'),
    actions = require('../actions');

module.exports = React.createClass({

    mixins: [
        Router.Navigation,
        Reflux.listenTo(actions.signupFailure, "onSignupFailure"),
        Reflux.listenTo(actions.signupSuccess, "onSignupSuccess")
    ],

    getInitialState: function() {
        return {
            errors: {}
        };
    },

    onSignupSuccess: function() {
        this.transitionTo(this.makeHref("submit"));
    },

    onSignupFailure: function(errors) {
        this.setState({ errors: errors });
    },

    handleSubmit: function(event) {
        event.preventDefault();
        
        var name = this.refs.name.getValue(),
            email = this.refs.email.getValue(),
            password = this.refs.password.getValue();

        actions.signup(name, email, password);
    },

    render: function() {

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
